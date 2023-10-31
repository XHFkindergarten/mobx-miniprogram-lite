const esbuild = require('esbuild')
const { join, resolve } = require('path')

  ; (async () => {
    const pkgPath = join(resolve(__dirname, '..', 'package.json'))
    const pkgInfo = require(pkgPath)
    const basePath = (() => {
      return resolve(pkgPath, '..')
    })()

    const entryPoints = join(basePath, 'src', 'index.ts')

    const outDir = join(basePath, 'example/miniprogram_npm/mobx-miniprogram-lite')

    const peerDependencyNames = pkgInfo.peerDependencies
      ? Object.keys(pkgInfo.peerDependencies)
      : []

    /** @type {import('esbuild').BuildContext} */
    const cjsCtx = await esbuild.context({
      entryPoints: {
        ['index']: entryPoints
      },
      outdir: outDir,
      bundle: true,
      platform: 'node',
      target: 'es2015',
      sourcemap: true,
      treeShaking: true,
      define: {
        'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV)
      },
      external: peerDependencyNames,
      format: 'cjs',
      tsconfig: join(basePath, 'tsconfig.json'),
      minify: false
    })

    cjsCtx.watch()
  })()
