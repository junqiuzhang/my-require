/**
 * 抽象Module对象
 */
(function (global) {
  const STATUS = {
    default: 0,
    loading: 1,
    loaded: 2,
    executed: 3
  };
  const context = {
    mainDir: '',
    modules: {},
  };
  function loadScript(src) {
    const headNode = document.getElementsByTagName('head')[0];
    const jsNode = document.createElement('script');
    jsNode.setAttribute('data-id', src);
    jsNode.setAttribute('src', src);
    headNode.appendChild(jsNode);
    return new Promise((resolve, reject) => {
      jsNode.onload = e => {
        resolve(e);
      };
    });
  }
  function getModule(src) {
    return context.modules[src] || (context.modules[src] = new Module({ src }));
  }
  class Module {
    constructor({ src, dependencies = [], callback = () => {} }) {
      this.status = STATUS.default;
      this.src = src;
      this.dependencies = dependencies;
      this.callback = callback;
      this.listeners = [];
    }
    setModules({ dependencies, callback }) {
      this.dependencies = dependencies;
      this.callback = callback;
    }
    getDependencyModules() {
      return this.dependencies.map(dependency => {
        return getModule(dependency);
      })
    }
    // 加载模块
    load() {
      console.log(this.src, 'load')
      debugger
      if (this.status < STATUS.loading) {
        this.status = STATUS.loading;
        loadScript(this.src).then(() => {
          this.status = STATUS.loaded;
          this.check();
        });
      } else {
        this.check();
      }
    }
    // 加载依赖模块
    loadDependencies() {
      console.log(this.src, 'loadDependencies')
      debugger
      const deps = this.getDependencyModules();
      deps.forEach(dep => {
        dep.listeners.push(this);
        dep.load();
      });
    }
    check() {
      console.log(this.src, 'check')
      debugger
      const deps = this.getDependencyModules();
      if (deps.every(dep => dep.status === STATUS.executed)) {
        this.exec();
        this.listeners.forEach(mod => {
          mod.check();
        });
      }
    }
    // 执行模块
    exec() {
      console.log(this.src, 'exec')
      debugger
      this.status = STATUS.executed;
      const deps = this.getDependencyModules();
      const args = deps.map(dep => dep.exec());
      return this.callback.apply(null, args);
    }
  }
  function define(dependencies, callback) {
    const src = document.currentScript.getAttribute('src');
    const mod = getModule(src);
    mod.setModules({ dependencies, callback });
    mod.loadDependencies();
  }
  global.define = define;
  global.require = define;
  (function () {
    const scriptNodes = document.getElementsByTagName('script');
    let mainSrc;
    for (let i = 0; i < scriptNodes.length; i++) {
      const scriptNode = scriptNodes[i];
      mainSrc = scriptNode.getAttribute('data-main');
      if (mainSrc) {
        break;
      }
    }
    context.mainDir = mainSrc.split('/').slice(0, -1).join('/') + '/';
    loadScript(mainSrc);
  })();
})(window);
