const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
const fs = require('fs');
puppeteer.use(StealthPlugin());

function findBrowser() {
  const paths = [
    process.env['PROGRAMFILES'] + '\\Google\\Chrome\\Application\\chrome.exe',
    process.env['PROGRAMFILES(X86)'] + '\\Google\\Chrome\\Application\\chrome.exe',
    process.env['LOCALAPPDATA'] + '\\Google\\Chrome\\Application\\chrome.exe',
    process.env['PROGRAMFILES(X86)'] + '\\Microsoft\\Edge\\Application\\msedge.exe',
    process.env['PROGRAMFILES'] + '\\Microsoft\\Edge\\Application\\msedge.exe',
  ];
  for (const p of paths) {
    if (p && fs.existsSync(p)) return p;
  }
  return undefined;
}

async function scrapeInstagram(username) {
  let browser;
  try {
    const executablePath = findBrowser();

    // Use a persistent profile directory to maintain cookies across runs
    const profileDir = require('path').join(require('os').tmpdir(), 'checker-browser-profile');
    if (!fs.existsSync(profileDir)) fs.mkdirSync(profileDir, { recursive: true });

    browser = await puppeteer.launch({
      headless: false,
      executablePath,
      userDataDir: profileDir,
      args: [
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-dev-shm-usage",
        "--window-size=1366,768",
        "--window-position=-32000,-32000",
        "--disable-blink-features=AutomationControlled",
      ],
    });

    const page = await browser.newPage();

    await page.setViewport({ width: 1366, height: 768 });

    // Randomized delay
    const randomDelay = Math.floor(Math.random() * 3000) + 2000;
    await new Promise(r => setTimeout(r, randomDelay));

    const cleanUsername = username.replace("@", "").trim();
    const url = `https://www.instagram.com/${cleanUsername}/`;

    // Intercept GraphQL dan API responses untuk data engagement
    const interceptedPosts = [];

    page.on('response', async response => {
      const resUrl = response.url();

      // Deteksi rate limit / IP block
      if (response.status() === 403 || response.status() === 429) {
        // Jangan langsung exit, biarkan flow berlanjut
      }

      // Intercept GraphQL queries yang berisi data post
      if (resUrl.includes('/graphql/query') || resUrl.includes('/api/v1/')) {
        try {
          const text = await response.text();
          const json = JSON.parse(text);

          // GraphQL response: edge_owner_to_timeline_media
          const extractPosts = (obj) => {
            if (!obj || typeof obj !== 'object') return;
            if (obj.edge_owner_to_timeline_media && obj.edge_owner_to_timeline_media.edges) {
              for (const edge of obj.edge_owner_to_timeline_media.edges) {
                const node = edge.node;
                if (node) {
                  interceptedPosts.push({
                    likes: node.edge_liked_by?.count || node.edge_media_preview_like?.count || 0,
                    comments: node.edge_media_to_comment?.count || node.edge_media_preview_comment?.count || 0,
                  });
                }
              }
            }
            // Recursively search nested objects
            for (const key of Object.keys(obj)) {
              if (typeof obj[key] === 'object' && obj[key] !== null) {
                extractPosts(obj[key]);
              }
            }
          };

          extractPosts(json);
        } catch (e) { }
      }
    });

    await page.goto(url, { waitUntil: "networkidle2", timeout: 45000 });

    const html = await page.content();

    const data = {
      isPrivate: false,
      notFound: false,
      username: cleanUsername,
      followers: 0,
      profilePicture: "",
      likes: [],
      comments: [],
    };

    // Cek halaman error / not found
    if (html.includes("Sorry, this page isn't available") || html.includes("Page Not Found")) {
      console.log(JSON.stringify({ notFound: true, error: "Profile not found" }));
      process.exit(0);
    }

    // --- Strategi 1: Parse dari meta tags (followers + profile picture) ---
    const descMatch = html.match(/<meta\s+name="description"\s+content="([^"]+)"/i) ||
                      html.match(/<meta\s+content="([^"]+)"\s+name="description"/i);
    if (descMatch && descMatch[1]) {
      const desc = descMatch[1];
      const followerMatch = desc.match(/([\d,.\w]+)\s+Followers/i);
      if (followerMatch && followerMatch[1]) {
        let fs = followerMatch[1].toLowerCase().replace(/,/g, '');
        if (fs.includes('m')) {
          data.followers = Math.round(parseFloat(fs) * 1000000);
        } else if (fs.includes('k')) {
          data.followers = Math.round(parseFloat(fs) * 1000);
        } else {
          data.followers = parseInt(fs) || 0;
        }
      }
    }

    // Profile picture dari og:image
    const ogMatch = html.match(/<meta\s+property="og:image"\s+content="([^"]+)"/i) ||
                    html.match(/<meta\s+content="([^"]+)"\s+property="og:image"/i);
    if (ogMatch && ogMatch[1]) {
      data.profilePicture = ogMatch[1];
    }

    // --- Strategi 2: Parse dari embedded JSON (window._sharedData atau script tags) ---
    // Instagram kadang embed data di berbagai script tags
    const scripts = await page.evaluate(() => {
      const scriptTags = document.querySelectorAll('script:not([src])');
      const contents = [];
      for (const tag of scriptTags) {
        const text = tag.textContent || '';
        if (text.includes('edge_owner_to_timeline_media') ||
            text.includes('edge_liked_by') ||
            text.includes('follower_count') ||
            text.includes('window._sharedData') ||
            text.includes('window.__additionalDataLoaded')) {
          contents.push(text);
        }
      }
      return contents;
    });

    for (const scriptContent of scripts) {
      try {
        // Coba extract JSON dari window._sharedData = {...};
        let jsonStr = null;
        const sharedDataMatch = scriptContent.match(/window\._sharedData\s*=\s*(\{.+\});?\s*$/s);
        if (sharedDataMatch) {
          jsonStr = sharedDataMatch[1];
        }

        // Coba extract JSON dari window.__additionalDataLoaded(...)
        const additionalMatch = scriptContent.match(/window\.__additionalDataLoaded\s*\([^,]+,\s*(\{.+\})\s*\)/s);
        if (additionalMatch) {
          jsonStr = additionalMatch[1];
        }

        // Kalau tidak ada pattern khusus, coba parse seluruh content sebagai JSON
        if (!jsonStr) {
          // Cari JSON object terbesar di dalam script
          const jsonMatch = scriptContent.match(/\{[^{}]*"edge_owner_to_timeline_media"[^{}]*\{[\s\S]*\}/);
          if (jsonMatch) {
            jsonStr = jsonMatch[0];
          }
        }

        if (jsonStr) {
          const parsed = JSON.parse(jsonStr);
          extractFromJSON(parsed, data);
        }
      } catch (e) { }
    }

    // --- Strategi 3: Gunakan data dari intercepted API responses ---
    if (interceptedPosts.length > 0 && data.likes.length === 0) {
      let count = 0;
      for (const post of interceptedPosts) {
        if (count >= 12) break;
        data.likes.push(post.likes);
        data.comments.push(post.comments);
        count++;
      }
    }

    // --- Strategi 4: Coba navigate ke post individual jika masih belum ada data ---
    if (data.likes.length === 0 && data.followers > 0) {
      // Coba scroll dulu untuk trigger lazy load
      await page.evaluate(() => { window.scrollBy(0, document.body.scrollHeight); });
      await new Promise(r => setTimeout(r, 3000));

      // Cek lagi intercepted posts setelah scroll
      if (interceptedPosts.length > 0) {
        let count = 0;
        for (const post of interceptedPosts) {
          if (count >= 12) break;
          data.likes.push(post.likes);
          data.comments.push(post.comments);
          count++;
        }
      }
    }

    // --- Strategi 5: Coba extract dari JSON-LD ---
    const jsonLdMatch = html.match(/<script\s+type="application\/ld\+json"[^>]*>([^<]+)<\/script>/gi);
    if (jsonLdMatch) {
      for (const match of jsonLdMatch) {
        try {
          const content = match.replace(/<script[^>]*>/, '').replace(/<\/script>/, '');
          const ld = JSON.parse(content);
          if (ld.mainEntity && ld.mainEntity.interactionStatistic) {
            for (const stat of ld.mainEntity.interactionStatistic) {
              if (stat['@type'] === 'InteractionCounter') {
                if (stat.interactionType === 'http://schema.org/FollowAction') {
                  if (!data.followers && stat.userInteractionCount) {
                    data.followers = parseInt(stat.userInteractionCount) || 0;
                  }
                }
              }
            }
          }
        } catch (e) { }
      }
    }

    // Cek private account
    if (html.includes("This account is private") || html.includes("This Account is Private")) {
      console.log(JSON.stringify({ isPrivate: true, error: "Account is private" }));
      process.exit(0);
    }

    if (data.followers === 0) {
      console.log(JSON.stringify({ error: "Failed to extract profile data. Instagram may be blocking this request." }));
      process.exit(0);
    }

    if (data.likes.length === 0) {
      console.log(JSON.stringify({ error: "Failed to extract recent post engagement data. Instagram may be rate-limiting the request." }));
      process.exit(0);
    }

    // Decode HTML entities in profile picture URL (e.g. &amp; → &)
    if (data.profilePicture) {
      data.profilePicture = data.profilePicture
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'");
    }

    console.log(JSON.stringify(data));

  } catch (error) {
    console.log(JSON.stringify({ error: error.message || "Unknown error" }));
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

// Helper: rekursif extract data post dari nested JSON
function extractFromJSON(obj, data) {
  if (!obj || typeof obj !== 'object') return;

  // Extract followers
  if (obj.edge_followed_by && obj.edge_followed_by.count && !data.followers) {
    data.followers = obj.edge_followed_by.count;
  }
  if (obj.follower_count && !data.followers) {
    data.followers = obj.follower_count;
  }

  // Extract profile picture
  if (obj.profile_pic_url_hd && !data.profilePicture) {
    data.profilePicture = obj.profile_pic_url_hd;
  }
  if (obj.profile_pic_url && !data.profilePicture) {
    data.profilePicture = obj.profile_pic_url;
  }

  // Extract private status
  if (obj.is_private === true) {
    data.isPrivate = true;
  }

  // Extract post engagement data
  if (obj.edge_owner_to_timeline_media && obj.edge_owner_to_timeline_media.edges) {
    let count = data.likes.length;
    for (const edge of obj.edge_owner_to_timeline_media.edges) {
      if (count >= 12) break;
      const node = edge.node || edge;
      if (node) {
        const likes = node.edge_liked_by?.count || node.edge_media_preview_like?.count || 0;
        const comments = node.edge_media_to_comment?.count || node.edge_media_preview_comment?.count || 0;
        data.likes.push(likes);
        data.comments.push(comments);
        count++;
      }
    }
  }

  // Recurse into nested objects (max depth to avoid circular)
  if (Array.isArray(obj)) {
    for (const item of obj) {
      extractFromJSON(item, data);
    }
  } else {
    for (const key of Object.keys(obj)) {
      if (typeof obj[key] === 'object' && obj[key] !== null && key !== 'edge_owner_to_timeline_media') {
        extractFromJSON(obj[key], data);
      }
    }
  }
}

const args = process.argv.slice(2);
if (args[0]) {
  scrapeInstagram(args[0]).then(() => process.exit(0));
}
