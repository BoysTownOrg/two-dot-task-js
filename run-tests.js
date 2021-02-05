// https://stackoverflow.com/a/54691621
import glob from "glob";
import Jasmine from "jasmine";

const jasmine = new Jasmine();

glob("./spec/*.js", (_er, files) => {
  Promise.all(
    files.map((f) =>
      import(f).catch((e) => {
        console.error(`** Error loading ${f}: `);
        console.error(e);
        process.exit(1);
      })
    )
  ).then(() => jasmine.execute());
});
