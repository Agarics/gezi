(function () {
  // WebGL2 -> WebGL1 安全回退：某些 Chrome 环境 WebGL2 context 创建失败
  // 引擎拿到 null 后调 getExtension() 崩溃；此补丁让引擎透明回退到 WebGL1
  var _getContext = HTMLCanvasElement.prototype.getContext;
  HTMLCanvasElement.prototype.getContext = function (type, attrs) {
    if (type === 'webgl2') {
      var ctx = _getContext.call(this, 'webgl2', attrs);
      if (ctx) return ctx;
      console.warn('[WebGL] WebGL2 不可用，降级到 WebGL1');
      return _getContext.call(this, 'webgl', attrs) ||
             _getContext.call(this, 'experimental-webgl', attrs);
    }
    return _getContext.call(this, type, attrs);
  };

  // WebGL 完全不可用时显示提示（Cocos 3.8.8 Canvas 2D 降级不完整，游戏必须有 WebGL）
  var c = document.createElement('canvas');
  if (!c.getContext('webgl2') && !c.getContext('webgl') && !c.getContext('experimental-webgl')) {
    console.warn('[WebGL] WebGL 不可用');
    document.addEventListener('DOMContentLoaded', function () {
      var msg = document.createElement('div');
      msg.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;display:flex;align-items:center;justify-content:center;background:#111;z-index:9999;';
      msg.innerHTML = '<div style="padding:32px 40px;background:#222;color:#fff;font-size:15px;border-radius:10px;text-align:center;line-height:2.2;max-width:400px;">'
        + '<div style="font-size:17px;font-weight:bold;margin-bottom:8px;">⚠️ 无法启动游戏</div>'
        + '<div style="font-size:13px;color:#ccc;margin-bottom:16px;">当前浏览器未开启硬件加速，游戏需要 WebGL 支持。</div>'
        + '<div style="font-size:13px;color:#aaa;margin-bottom:20px;">开启步骤：Chrome 右上角菜单 → 设置 → 系统<br>→ 开启「使用硬件加速模式」→ 重启浏览器</div>'
        + '<div style="margin-bottom:8px;font-size:12px;color:#aaa;">复制以下地址，粘贴到 Chrome 地址栏并回车：</div>'
        + '<input id="__settings_url" readonly value="chrome://settings/system" style="width:100%;box-sizing:border-box;padding:8px 12px;background:#333;color:#fff;border:1px solid #555;border-radius:6px;font-size:13px;text-align:center;cursor:pointer;" />'
        + '<div id="__copy_tip" style="margin-top:8px;font-size:12px;color:#8f8;display:none;">✅ 已复制！</div>'
        + '</div>';
      document.body.appendChild(msg);
      var inp = document.getElementById('__settings_url');
      inp.addEventListener('click', function () {
        inp.select();
        var tip = document.getElementById('__copy_tip');
        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(inp.value).then(function () { tip.style.display = 'block'; });
        } else {
          document.execCommand('copy');
          tip.style.display = 'block';
        }
      });
    });
  }
})();
