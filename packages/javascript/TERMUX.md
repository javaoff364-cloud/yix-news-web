# Using YIX News in Termux

YIX News supports Termux on Android with Node.js 18 or newer.

## 1. Install Node.js

Update Termux packages and install Node.js:

\`\`\`bash
pkg update && pkg upgrade -y
pkg install nodejs -y
node --version
npm --version
\`\`\`

If Node.js fails with a linker error mentioning \`libc++\`, update the Termux packages and reinstall both packages:

\`\`\`bash
pkg update && pkg upgrade -y
pkg reinstall libc++ nodejs -y
\`\`\`

Install Termux from a trusted, current distribution source. Avoid mixing Termux add-ons from different signing sources.

## 2. Run the CLI without a global install

\`\`\`bash
npx yixnews --help
npx yixnews status
npx yixnews news --country uzbekistan --language uz --limit 5
\`\`\`

Other commands:

\`\`\`bash
npx yixnews categories --country uzbekistan --language uz
npx yixnews sources --country uzbekistan --language uz
\`\`\`

## 3. Use the JavaScript SDK in a project

\`\`\`bash
mkdir yixnews-test
cd yixnews-test
npm init -y
npm install yixnews
\`\`\`

Create \`test.mjs\`:

\`\`\`js
import { YIXNews } from "yixnews";

const yix = new YIXNews();
const result = await yix.getNews({
  country: "uzbekistan",
  language: "uz",
  limit: 5
});

for (const article of result.news) {
  console.log(article.title);
  console.log(article.link);
}
\`\`\`

Run it:

\`\`\`bash
node test.mjs
\`\`\`

## Troubleshooting

- \`ERR_MODULE_NOT_FOUND\`: run \`npm install yixnews\` inside the same directory as your script.
- \`yixnews: command not found\`: use \`npx yixnews ...\`; the package is also an SDK, not a globally installed command.
- Node linker errors: update Termux and reinstall \`libc++\` and \`nodejs\`.
- API/network errors: check your internet connection and run \`npx yixnews status\`.

Project documentation: https://yixnews.vercel.app/docs.html
