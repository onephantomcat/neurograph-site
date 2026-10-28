(() => {
  'use strict';
  const base = new URL('.', document.currentScript.src);
  const version = '20261028-inspector';
  let loading;
  const script = name => new Promise((resolve, reject) => {
    const element = document.createElement('script');
    element.src = new URL(name+'?v='+version, base);
    element.onload = resolve;
    element.onerror = () => reject(new Error('模型架构脚本读取失败，请刷新重试'));
    document.head.append(element);
  });
  window.ArchitectureLibrary = {
    show() {
      if (!loading) {
        const css = document.createElement('link');
        css.rel = 'stylesheet'; css.href = new URL('architecture-library.css?v='+version, base);
        document.head.append(css);
        loading = script('architecture-core.js').then(() => script('architecture-library.js'));
      }
      loading.then(() => window.ArchitectureExplorer.show(base)).catch(error => {
        const root = document.getElementById('view-architectures');
        const status = root.querySelector('#architecture-status');
        if (status) {status.textContent=error.message;status.setAttribute('role','alert');}
        else {root.textContent = error.message;root.setAttribute('role', 'alert');loading = undefined;}
      });
    }
  };
})();
