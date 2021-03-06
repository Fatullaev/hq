import cssnano from 'cssnano';
import { getBrowsersList } from './utils.mjs';
import less from 'postcss-less-engine';
import postcss from 'postcss';
import postcssPresetEnv from 'postcss-preset-env';
import sass from 'postcss-node-sass';

export default async (ctx, content, sourceMap, skipSM) => {
  const { ua } = ctx.store;
  // const replaced = await replaceRelativePath(ctx);
  const plugins = [
    postcssPresetEnv({
      browsers: getBrowsersList(ua),
      features: {
        calc: false,
        customProperties: false,
        prev: sourceMap,
      },
    }),
    cssnano({
      preset: [
        'advanced', { normalizeWhitespace: false },
      ],
    }),
  ];
  const options = { from: undefined };
  if (!skipSM) options.map = {
    annotation: `${ctx.path}.map`,
    inline: false,
  };
  // TODO: prettyprint
  if (ctx.stats.ext === '.scss' || ctx.stats.ext === '.sass') {
    plugins.unshift(sass());
  } else if (ctx.stats.ext === '.less') {
    plugins.unshift(less());
    options.parser = less.parser;
  }
  const { css, map } = await postcss(plugins)
    .process(content, options);
  return { code: css, map };
};
