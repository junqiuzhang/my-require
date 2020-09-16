(function (global) {
  const context = {
    mainDir: '',
    modules: {},
    moduleCallbacks: {}
  };
  function loadScript(url, id) {
    const headNode = document.getElementsByTagName('head')[0];
    const jsNode = document.createElement('script');
    jsNode.setAttribute('type', 'text/javascript');
    jsNode.setAttribute('src', url);
    jsNode.setAttribute('data-id', id);
    headNode.appendChild(jsNode);
    return new Promise((resolve, reject) => {
      jsNode.onload = e => {
        resolve(e);
      };
    });
  }
  function getModules(deps) {
    return deps.map(dep => {
      const curMod = context.modules[dep];
      if (curMod && curMod.ready && curMod.dependencies && curMod.callback) {
        return curMod.callback.apply(null, getModules(curMod.dependencies));
      }
    });
  }
  function define(dependencies, callback) {
    const id = document.currentScript
      ? document.currentScript.getAttribute('data-id')
      : 'data-main-id';
    context.modules[id] = {
      dependencies,
      callback
    };
    function regisModuleCallback(deps) {
      deps.forEach(dep => {
        if (!context.moduleCallbacks[dep]) {
          context.moduleCallbacks[dep] = {};
        }
        context.moduleCallbacks[dep][id] = loadModuleCallback;
      });
    }
    function execModuleCallback(dep) {
      for (const id in context.moduleCallbacks[dep]) {
        if (context.moduleCallbacks[dep].hasOwnProperty(id)) {
          const cb = context.moduleCallbacks[dep][id];
          cb();
        }
      }
    }
    function loadModuleCallback() {
      // 如果没有依赖
      if (!dependencies.length) {
        context.modules[id].ready = true;
        context.modules[id].callback.apply(null, []);
        execModuleCallback(id);
        return;
      }
      // 如果有依赖
      const allLoaded = dependencies.every(dep => {
        return context.modules[dep] && context.modules[dep].ready;
      });
      // 如果依赖加载完了
      if (allLoaded) {
        const dependencyModules = getModules(dependencies);
        context.modules[id].ready = true;
        context.modules[id].callback.apply(null, dependencyModules);
        execModuleCallback(id);
        return;
      }
      // 如果依赖没有加载完
      const unloadDependencies = dependencies.filter(dep => {
        return !context.modules[dep];
      });
      unloadDependencies.forEach(dep => {
        return loadScript(context.mainDir + dep, dep);
      });
    }
    // 注册
    regisModuleCallback(dependencies);
    // 执行
    loadModuleCallback();
  }
  global.define = define;
  global.require = define;
  (function () {
    const scriptNodes = document.getElementsByTagName('script');
    for (let i = 0; i < scriptNodes.length; i++) {
      const scriptNode = scriptNodes[i];
      const mainUrl = scriptNode.getAttribute('data-main');
      if (mainUrl) {
        context.mainDir = mainUrl.split('/').slice(0, -1).join('/') + '/';
        loadScript(mainUrl, mainUrl);
        break;
      }
    }
  })();
})(window);
