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

async function scrapeTikTok(username) {
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

    const cleanUsername = username.startsWith("@") ? username : `@${username}`;
    const url = `https://www.tiktok.com/${cleanUsername}`;

    const interceptedStats = [];

    page.on('response', async response => {
        const resUrl = response.url();
        // Cek deteksi blokir IP (403/429)
        if (response.status() === 403 || response.status() === 429) {
            console.log(JSON.stringify({ error: `Akses diblokir oleh TikTok (Status: ${response.status()}). IP Anda mungkin terkena Rate Limit.` }));
            process.exit(0);
        }
        if (resUrl.includes('/api/item_list/') || resUrl.includes('/api/post/item_list/') || resUrl.includes('/api/user/post/')) {
            try {
                const json = await response.json();
                if (json && json.itemList) {
                    for (const item of json.itemList) {
                        if (item.stats) {
                            interceptedStats.push(item.stats);
                        }
                    }
                }
            } catch(e) { }
        }
    });

    await page.goto(url, { waitUntil: "networkidle2", timeout: 30000 });

    // Sometimes TikTok blocks on first load but allows on reload (cookies are now set)
    await new Promise(r => setTimeout(r, 2000));
    await page.reload({ waitUntil: "networkidle2", timeout: 30000 });

    const html = await page.content();
    const data = {
      isPrivate: false,
      notFound: false,
      username: cleanUsername,
      followers: 0,
      profilePicture: "",
      views: [],
      likes: [],
      comments: [],
      shares: []
    };

    // Extract user info and secUid from rehydration data
    let secUid = null;
    const match = html.match(/<script id="__UNIVERSAL_DATA_FOR_REHYDRATION__"[^>]*>([^<]+)<\/script>/);
    if (match) {
        try {
            const stateData = JSON.parse(match[1]);
            const userModule = stateData.__DEFAULT_SCOPE__?.['webapp.user-detail']?.userInfo;
            if (userModule) {
                data.followers = userModule.stats.followerCount || 0;
                data.profilePicture = userModule.user.avatarLarger || userModule.user.avatarMedium || "";
                data.isPrivate = userModule.user.secret || false;
                secUid = userModule.user.secUid || null;

                const userPosts = stateData.__DEFAULT_SCOPE__?.['webapp.user-detail']?.itemList || [];
                const itemList = stateData.__DEFAULT_SCOPE__?.['webapp.video-detail']?.itemList || [];
                const videos = userPosts.length > 0 ? userPosts : itemList;

                let count = 0;
                for (const vid of videos) {
                   if (count >= 9) break;
                   if (vid && vid.stats) {
                      data.views.push(vid.stats.playCount || 0);
                      data.likes.push(vid.stats.diggCount || 0);
                      data.comments.push(vid.stats.commentCount || 0);
                      data.shares.push(vid.stats.shareCount || 0);
                      count++;
                   }
                }
            }
        } catch(e) { }
    }

    if (!data.followers && html.includes("Couldn't find this account")) {
        console.log(JSON.stringify({ notFound: true, error: "Profile not found" }));
        process.exit(0);
    }
    if (!data.followers && html.includes("This account is private")) {
        console.log(JSON.stringify({ isPrivate: true, error: "Account is private" }));
        process.exit(0);
    }
    if (data.isPrivate) {
        console.log(JSON.stringify({ isPrivate: true, error: "Account is private" }));
        process.exit(0);
    }

    if (data.followers === 0) {
        console.log(JSON.stringify({ error: "Failed to extract required profile followers." }));
        process.exit(0);
    }

    // If videos not in initial HTML, try clicking Refresh button or scrolling
    if (data.views.length === 0) {
        // Try clicking refresh button if "Something went wrong" is shown
        try {
            const buttons = await page.$$('button');
            for (const btn of buttons) {
                const text = await page.evaluate(el => el.textContent, btn);
                if (text && text.trim() === 'Refresh') {
                    await btn.click();
                    await new Promise(r => setTimeout(r, 5000));
                    break;
                }
            }
        } catch(e) { }

        // Scroll to trigger lazy loading
        await page.evaluate(() => { window.scrollBy(0, document.body.scrollHeight); });
        await new Promise(r => setTimeout(r, 3000));
    }

    // Collect from intercepted API stats
    if (data.views.length < 9) {
         let count = data.views.length;
         for (const stats of interceptedStats) {
             if (count >= 9) break;
             const playCount = stats.playCount || 0;
             if (!data.views.includes(playCount)) {
                data.views.push(playCount);
                data.likes.push(stats.diggCount || 0);
                data.comments.push(stats.commentCount || 0);
                data.shares.push(stats.shareCount || 0);
                count++;
             }
         }
    }

    // If still no videos, try fetching from TikTok API inside browser context
    if (data.views.length === 0 && secUid) {
        try {
            const apiResult = await page.evaluate(async (secUid) => {
                try {
                    const res = await fetch(`https://www.tiktok.com/api/post/item_list/?WebIdLastTime=&aid=1988&count=15&secUid=${secUid}`, {
                        credentials: 'include',
                        headers: { 'Accept': 'application/json' },
                    });
                    const json = await res.json();
                    if (json && json.itemList) {
                        return json.itemList.map(item => ({
                            views: item.stats?.playCount || 0,
                            likes: item.stats?.diggCount || 0,
                            comments: item.stats?.commentCount || 0,
                            shares: item.stats?.shareCount || 0,
                        }));
                    }
                    return [];
                } catch(e) {
                    return [];
                }
            }, secUid);

            if (apiResult.length > 0) {
                let count = 0;
                for (const item of apiResult) {
                    if (count >= 9) break;
                    data.views.push(item.views);
                    data.likes.push(item.likes);
                    data.comments.push(item.comments);
                    data.shares.push(item.shares);
                    count++;
                }
            }
        } catch(e) { }
    }

    // If still no videos, try scraping video elements from DOM
    if (data.views.length === 0) {
        const domData = await page.evaluate(() => {
            const items = [];
            const containers = document.querySelectorAll('[data-e2e="user-post-item"]');
            for (const c of containers) {
                const viewEl = c.querySelector('[data-e2e="video-views"]') || c.querySelector('strong');
                if (viewEl) {
                    let txt = viewEl.textContent.trim();
                    let val = 0;
                    if (txt.includes('M')) val = Math.round(parseFloat(txt) * 1000000);
                    else if (txt.includes('K')) val = Math.round(parseFloat(txt) * 1000);
                    else val = parseInt(txt.replace(/\D/g, '')) || 0;
                    items.push(val);
                }
            }
            return items;
        });
        if (domData.length > 0) {
            for (let i = 0; i < Math.min(domData.length, 9); i++) {
                data.views.push(domData[i]);
                data.likes.push(0);
                data.comments.push(0);
                data.shares.push(0);
            }
        }
    }

    // Last resort: re-parse page HTML after interactions
    if (data.views.length === 0) {
        const html2 = await page.content();
        const match2 = html2.match(/<script id="__UNIVERSAL_DATA_FOR_REHYDRATION__"[^>]*>([^<]+)<\/script>/);
        if (match2) {
            try {
                const stateData2 = JSON.parse(match2[1]);
                const userPosts2 = stateData2.__DEFAULT_SCOPE__?.['webapp.user-detail']?.itemList || [];
                let count = 0;
                for (const vid of userPosts2) {
                    if (count >= 9) break;
                    if (vid && vid.stats) {
                        data.views.push(vid.stats.playCount || 0);
                        data.likes.push(vid.stats.diggCount || 0);
                        data.comments.push(vid.stats.commentCount || 0);
                        data.shares.push(vid.stats.shareCount || 0);
                        count++;
                    }
                }
            } catch(e) { }
        }
    }

    if (data.views.length === 0) {
        console.log(JSON.stringify({ error: "TikTok's anti-bot system blocked access to recent videos. Please use the manual entry form below." }));
        process.exit(0);
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

const args = process.argv.slice(2);
if (args[0]) {
    scrapeTikTok(args[0]).then(() => process.exit(0));
}
