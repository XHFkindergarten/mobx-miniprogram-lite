const esbuild = require('esbuild')
const { join, resolve } = require('path')

const shouldWatch =
  process.argv.length > 2 && ['-w', '--watch'].includes(process.argv[2])

  ; (async () => {
    const pkgPath = join(resolve(__dirname, '..', 'package.json'))
    const pkgInfo = require(pkgPath)
    const basePath = (() => {
      return resolve(pkgPath, '..')
    })()

    const entryPoints = join(basePath, 'src', 'index.ts')

    const outDir = join(basePath, 'lib')

    const peerDependencyNames = pkgInfo.peerDependencies
      ? Object.keys(pkgInfo.peerDependencies)
      : []

    /** @type {import('esbuild').BuildContext} */
    const esmCtx = await esbuild.context({
      entryPoints: [entryPoints],
      outdir: outDir,
      bundle: true,
      target: 'es2015',
      sourcemap: shouldWatch ? 'inline' : true,
      define: {
        'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV)
      },
      external: peerDependencyNames,
      splitting: false,
      treeShaking: true,
      format: 'esm',
      tsconfig: join(basePath, 'tsconfig.json'),
      minify: !shouldWatch
    })

    /** @type {import('esbuild').BuildContext} */
    const cjsCtx = await esbuild.context({
      entryPoints: {
        ['index.common']: entryPoints
      },
      outdir: outDir,
      bundle: true,
      platform: 'node',
      target: 'es2015',
      sourcemap: shouldWatch ? 'inline' : true,
      treeShaking: true,
      define: {
        'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV)
      },
      external: peerDependencyNames,
      format: 'cjs',
      tsconfig: join(basePath, 'tsconfig.json'),
      minify: !shouldWatch
    })

    if (shouldWatch) {
      esmCtx.watch()
      cjsCtx.watch()
    } else {
      await Promise.all([
        esmCtx.rebuild(),
        cjsCtx.rebuild(),
      ]).finally(() => {
        esmCtx.dispose()
        cjsCtx.dispose()
      })
    }
  })()
