const __require_context__ = {
  main_dir_name: '',
  require_modules: {},
  require_modules_callback: {},
}
function loadScript(url, id) {
  const body = document.getElementsByTagName('head')[0];
  const jsNode = document.createElement('script');

  jsNode.setAttribute('type', 'text/javascript');
  jsNode.setAttribute('src', url);
  jsNode.setAttribute('id', id);

  body.appendChild(jsNode);

  return new Promise((resolve, reject) => {
    jsNode.onload = (e) => {
      resolve(e)
    }
  })
}
function getModules(deps) {
  const mods = []
  deps.forEach(dep => {
    const curMod = __require_context__.require_modules[dep]
    if (curMod) {
      const curDeps = getModules(curMod.dependencies)
      if (curDeps.length === curMod.dependencies.length) {
        mods.push(curMod.callback.apply(null, curDeps))
      }
    }
  })
  return mods
}
function define(dependencies, callback) {
  const id = document.currentScript ? document.currentScript.id : 'require://main'
  __require_context__.require_modules[id] = {
    dependencies,
    callback,
  }
  function regisModuleCallback(deps) {
    deps.forEach(dep => {
      if (!__require_context__.require_modules_callback[dep]) {
        __require_context__.require_modules_callback[dep] = {}
      }
      __require_context__.require_modules_callback[dep][id] = loadModuleCallback
    })
  }
  function execModuleCallback(dep) {
    for (const id in __require_context__.require_modules_callback[dep]) {
      if (__require_context__.require_modules_callback[dep].hasOwnProperty(id)) {
        const cb = __require_context__.require_modules_callback[dep][id]
        cb()
      }
    }
  }
  function loadModuleCallback() {
    // 如果没有依赖
    if (!dependencies.length) {
      __require_context__.require_modules[id].callback.apply(null, [])
      execModuleCallback(id)
      return;
    }
    // 如果有依赖
    const dependencyModules = getModules(dependencies)
    // 如果依赖加载完了
    if (dependencyModules.length === dependencies.length) {
      __require_context__.require_modules[id].callback.apply(null, dependencyModules)
      execModuleCallback(id)
      return;
    }
    // 如果依赖没有加载完
    const unloadDependencies = dependencies.filter(dep => {
      return !__require_context__.require_modules[dep]
    })
    unloadDependencies.forEach(dep => {
      return loadScript(__require_context__.main_dir_name + dep, dep)
    })
  }
  // 注册
  regisModuleCallback(dependencies)
  // 执行
  loadModuleCallback()
}
const require = define;
(function () { 
  const main_url = document.getElementById('require').dataset.main
  __require_context__.main_dir_name = main_url.split('/').slice(0, -1).join('/') + '/'
  loadScript(main_url, main_url)
})()