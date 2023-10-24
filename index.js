const cli = require("cac")();
const exec = require("child_process").exec;
const figlet = require("figlet");

const authors = [
  "mor",
  "Kawabata",
  "Tomoyuki",
  "WataruShimomura",
  "masarufuruya",
  "asamuzak",
  "Cai",
];

const result = {
  sumPlusDiff: 0,
  sumMinusDiff: 0,
  sumDiff: 0,
  name: "",
};

const execPromise = (command) => {
  return new Promise((resolve, reject) => {
    exec(command, (err, stdout, stderr) => {
      if (err) {
        reject(err);
        return;
      }
      resolve(stdout);
    });
  });
};

cli
  .command("exec [...directories]", "")
  .action(async (directories, options) => {
    let results = [];

    for (const author of authors) {
      let plusDiff = 0;
      let minusDiff = 0;
      for (const directory of directories) {
        try {
          process.chdir(directory);
          const command = `git log --numstat --pretty="%H" --author=${author} --since=2023-10-01 --until=2023-10-31 | awk 'NF==3 {plus+=$1; minus+=$2} END {printf("+%d, -%d\\n", plus, minus)}'`;

          const stdout = await execPromise(command);
          plusDiff += Number(stdout.match(/([+]\d+)/)[1].replace("+", ""));
          minusDiff += Number(stdout.match(/([-]\d+)/)[1].replace("-", ""));
        } catch (e) {
          console.log(e);
        }
      }

      results.push({
        name: author,
        plusDiff,
        minusDiff,
        sumDiff: plusDiff + minusDiff,
      });
    }

    console.log(
      figlet.textSync("October PharmaX", {
        font: "Ghost",
        horizontalLayout: "default",
        verticalLayout: "default",
        width: 300,
        whitespaceBreak: true,
      })
    );
    console.log(
      figlet.textSync("Best Contributor", {
        font: "Ghost",
        horizontalLayout: "default",
        verticalLayout: "default",
        width: 300,
        whitespaceBreak: true,
      })
    );

    results.sort((a, b) => {
      return b.sumDiff - a.sumDiff;
    });

    results.forEach((result, i) => {
      console.log(`${i + 1}位`);
      console.log(result.name);
      console.log(`+${result.plusDiff}`);
      console.log(`-${result.minusDiff}`);
      console.log(`±${result.sumDiff}`);
      console.log("--------------------------------------");
    });
  });

cli.help();

cli.parse();
