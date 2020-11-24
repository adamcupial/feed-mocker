import handlebars from 'handlebars';
import moment from 'moment';

function createHelper (defaultFormat) {
  return (...args) => {
    const now = moment();

    if (args.length === 1) {
      return now.format(defaultFormat);
    }

    if (args.length === 2) {
      return now.format(args[0]);
    }

    if (args.length === 3 || args.length === 4) {
      const [oper, unit, format] = args;
      const mode = `${oper}`[0] === '-' ? 'subtract' : 'add';
      const amount = Number(`${oper}`.slice(1));

      if (args.length === 3) {
        return now[mode](amount, unit).format(defaultFormat);
      }

      return now[mode](amount, unit).format(format);
    }

    throw new Error(`now has 0-3 attributes ${args.length - 1} given`);
  };
}

handlebars.registerHelper('today', createHelper('YYYY-MM-DD'));
handlebars.registerHelper('now', createHelper('YYYY-MM-DD HH:mm:ss'));

export function transform (text) {
  const template = handlebars.compile(text);
  return template();
}
