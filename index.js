const puppeteer = require("puppeteer");
const { brotliDecompressSync } = require("zlib");
const {exec} = require("child_process");

// promise that resolve itself in (time (milliseconds))
const waitPromise = (time) => {
    return new Promise(function(resolve, reject) {
        setTimeout(() => {resolve()}, time);
    });
}

const meets = {
    algebra: "",
    science: "",
    gym: "",
    english: "",
    chinese: "",
    tech: ""
}

var getState = async (page) => {
    var waiting = await page.evaluate(_ => {
        text = document.body.innerText; 
        if (text.includes("You can't create a meeting yourself")) {
            return 'notready';
        } else if (text.includes("Getting ready")) {
            return 'loading';
        } else if (text.includes("Join now")) {
            return 'ready';
        } else {
            return 'unknown';
        } 
    });
    return waiting;
}



var run = async () => {
    const browser = await puppeteer.launch({
        headless: false,
        userDataDir: "./user_data"
    });
    const page = await browser.newPage();
    await page.goto(meets.tech); // FILL IN YOUR MEET INFORMATION ON THIS LINE!!
    
    while (true) {
        await removePersonalInformation(page);
        await waitPromise(2000); // wait for stuff to finish.
        var state = await getState(page);
        if (state == 'loading') {
            await waitPromise(5000);
            state = await getState(page);
        }
        if (state == 'notready') {
            console.log("meet is not ready... reloading in 15 seconds.");
            await waitPromise(15000);
            page.reload();
            continue;
        } else if (state != 'ready') {
            console.log("couldn't get meet to load. ");
            break;
        } else if (state == 'ready') {
            console.log("BEEP BEEP! Class is ready for you to join. ");
            break;
        }
    }


    

    await browser.close();
}

run();
