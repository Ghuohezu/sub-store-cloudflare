export function renderAdminHtml() {
  return `<!doctype html>
<html lang="zh-CN">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Sub-Store Cloudflare</title>
  <style>
    :root {
      color-scheme: light;
      --bg: #f7f8fa;
      --panel: #ffffff;
      --panel-2: #f1f4f7;
      --text: #17202a;
      --muted: #657282;
      --line: #d9e0e7;
      --accent: #0f766e;
      --accent-2: #155e75;
      --danger: #b42318;
      --shadow: 0 10px 28px rgba(20, 31, 43, 0.08);
      font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
    }

    * { box-sizing: border-box; }
    body {
      margin: 0;
      background: var(--bg);
      color: var(--text);
      font-size: 14px;
      line-height: 1.5;
    }
    button, input, textarea, select { font: inherit; }
    button {
      border: 1px solid var(--line);
      background: var(--panel);
      color: var(--text);
      min-height: 34px;
      border-radius: 6px;
      padding: 0 12px;
      cursor: pointer;
    }
    button.primary { background: var(--accent); border-color: var(--accent); color: #fff; }
    button.danger { color: var(--danger); }
    button:disabled { opacity: .55; cursor: not-allowed; }
    input, textarea, select {
      width: 100%;
      border: 1px solid var(--line);
      background: #fff;
      color: var(--text);
      border-radius: 6px;
      padding: 8px 10px;
      min-height: 36px;
    }
    textarea {
      min-height: 150px;
      resize: vertical;
      font-family: "SFMono-Regular", Consolas, monospace;
      font-size: 12px;
      line-height: 1.45;
    }
    label { display: grid; gap: 6px; color: var(--muted); font-size: 12px; }
    .shell { min-height: 100vh; display: grid; grid-template-columns: 248px 1fr; }
    aside {
      border-right: 1px solid var(--line);
      background: #fff;
      padding: 22px 18px;
      position: sticky;
      top: 0;
      height: 100vh;
    }
    .brand { font-size: 18px; font-weight: 760; margin-bottom: 4px; }
    .sub { color: var(--muted); font-size: 12px; margin-bottom: 22px; }
    .nav { display: grid; gap: 6px; }
    .nav button { justify-content: flex-start; text-align: left; border-color: transparent; background: transparent; }
    .nav button.active { background: var(--panel-2); border-color: var(--line); color: var(--accent-2); }
    main { padding: 28px; max-width: 1260px; width: 100%; }
    .topbar { display: flex; justify-content: space-between; align-items: flex-start; gap: 16px; margin-bottom: 20px; }
    h1 { font-size: 24px; line-height: 1.2; margin: 0 0 6px; letter-spacing: 0; }
    p { margin: 0; color: var(--muted); }
    .actions { display: flex; flex-wrap: wrap; gap: 8px; }
    .grid { display: grid; grid-template-columns: minmax(0, 1fr) 390px; gap: 18px; align-items: start; }
    .panel {
      background: var(--panel);
      border: 1px solid var(--line);
      border-radius: 8px;
      box-shadow: var(--shadow);
      overflow: hidden;
    }
    .panel-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 14px 16px;
      border-bottom: 1px solid var(--line);
      background: #fbfcfd;
    }
    .panel-title { font-weight: 700; }
    .list { display: grid; }
    .row {
      display: grid;
      gap: 6px;
      padding: 13px 16px;
      border-bottom: 1px solid var(--line);
      cursor: pointer;
    }
    .row:last-child { border-bottom: 0; }
    .row.active { background: #edf7f5; }
    .row-title { display: flex; justify-content: space-between; gap: 10px; font-weight: 650; }
    .row-meta { color: var(--muted); font-size: 12px; overflow-wrap: anywhere; }
    .tag { border: 1px solid var(--line); border-radius: 999px; padding: 2px 8px; font-size: 11px; color: var(--muted); white-space: nowrap; }
    .form { padding: 16px; display: grid; gap: 12px; }
    .two { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
    .checkbox { display: flex; align-items: center; gap: 8px; color: var(--text); font-size: 13px; }
    .checkbox input { width: auto; min-height: auto; }
    .footer-actions { display: flex; gap: 8px; justify-content: flex-end; padding-top: 4px; }
    .notice { margin-bottom: 14px; padding: 10px 12px; border: 1px solid var(--line); background: #fff; border-radius: 8px; color: var(--muted); }
    .hidden { display: none; }
    .empty { padding: 22px 16px; color: var(--muted); }
    .linkbox { font-family: "SFMono-Regular", Consolas, monospace; font-size: 12px; overflow-wrap: anywhere; background: var(--panel-2); padding: 10px; border-radius: 6px; border: 1px solid var(--line); }
    .toast { position: fixed; right: 18px; bottom: 18px; background: #102029; color: #fff; border-radius: 7px; padding: 10px 12px; opacity: 0; transform: translateY(8px); transition: .18s ease; }
    .toast.show { opacity: 1; transform: translateY(0); }

    @media (max-width: 900px) {
      .shell { grid-template-columns: 1fr; }
      aside { height: auto; position: static; border-right: 0; border-bottom: 1px solid var(--line); }
      .nav { grid-template-columns: repeat(2, minmax(0, 1fr)); }
      main { padding: 18px; }
      .grid { grid-template-columns: 1fr; }
      .topbar { display: grid; }
    }
  </style>
</head>
<body>
  <div class="shell">
    <aside>
      <div class="brand">Sub-Store Cloudflare</div>
      <div class="sub">订阅源、组合、模板和输出链接统一配置。</div>
      <div class="nav">
        <button data-tab="sources" class="active">订阅源</button>
        <button data-tab="collections">组合订阅</button>
        <button data-tab="templates">规则模板</button>
        <button data-tab="profiles">输出链接</button>
        <button data-tab="backup">导入导出</button>
      </div>
    </aside>
    <main>
      <div class="topbar">
        <div>
          <h1 id="pageTitle">订阅源</h1>
          <p id="pageDesc">添加远程订阅或本地节点文本，后续由组合订阅统一聚合。</p>
        </div>
        <div class="actions">
          <button id="refreshBtn">刷新</button>
          <button id="newBtn" class="primary">新建</button>
        </div>
      </div>
      <div id="tokenNotice" class="notice hidden">
        设置了管理 token。请在 URL 后添加 <code>?token=...</code>，或在浏览器 localStorage 里保存 <code>substore_admin_token</code>。
      </div>
      <section id="content"></section>
    </main>
  </div>
  <div id="toast" class="toast"></div>
  <script>
    const state = { tab: "sources", config: null, selectedId: null };
    const token = new URLSearchParams(location.search).get("token") || localStorage.getItem("substore_admin_token") || "";
    if (token) localStorage.setItem("substore_admin_token", token);

    const tabs = {
      sources: { title: "订阅源", desc: "添加远程订阅或本地节点文本，后续由组合订阅统一聚合。" },
      collections: { title: "组合订阅", desc: "选择多个订阅源，配置过滤和排序，形成一个云端聚合结果。" },
      templates: { title: "规则模板", desc: "配置 proxy-groups、rule-providers 和 rules。模板保存在 D1，不和代码耦合。" },
      profiles: { title: "输出链接", desc: "把组合订阅、目标格式和规则模板绑定为客户端使用的订阅地址。" },
      backup: { title: "导入导出", desc: "导出完整配置，或一次性导入 sources、collections、templates、profiles。" },
    };

    const api = async (path, options = {}) => {
      const headers = { "content-type": "application/json", ...(options.headers || {}) };
      if (token) headers.authorization = "Bearer " + token;
      const res = await fetch(path, { ...options, headers });
      const payload = await res.json().catch(() => ({}));
      if (!res.ok || payload.status === "failed") throw new Error(payload.error?.message || res.statusText);
      return payload.data;
    };

    const byId = (id) => document.getElementById(id);
    const toast = (message) => {
      const el = byId("toast");
      el.textContent = message;
      el.classList.add("show");
      setTimeout(() => el.classList.remove("show"), 1800);
    };
    const safeJson = (value, fallback) => {
      try { return JSON.parse(value || ""); } catch { return fallback; }
    };

    async function load() {
      state.config = await api("/api/config");
      render();
    }

    function setTab(tab) {
      state.tab = tab;
      state.selectedId = null;
      render();
    }

    function render() {
      document.querySelectorAll(".nav button").forEach((button) => button.classList.toggle("active", button.dataset.tab === state.tab));
      byId("pageTitle").textContent = tabs[state.tab].title;
      byId("pageDesc").textContent = tabs[state.tab].desc;
      byId("newBtn").classList.toggle("hidden", state.tab === "backup");
      if (!state.config) return;
      byId("tokenNotice").classList.add("hidden");

      if (state.tab === "backup") return renderBackup();
      const items = state.config[state.tab] || [];
      const selected = items.find((item) => item.id === state.selectedId) || items[0] || null;
      if (!state.selectedId && selected) state.selectedId = selected.id;
      byId("content").innerHTML = '<div class="grid"><div class="panel"><div class="panel-header"><div class="panel-title">列表</div><span class="tag">' + items.length + '</span></div><div class="list">' +
        (items.length ? items.map((item) => rowHtml(item, selected)).join("") : '<div class="empty">暂无数据</div>') +
        '</div></div><div class="panel"><div class="panel-header"><div class="panel-title">编辑</div></div>' +
        (selected ? formHtml(state.tab, selected) : '<div class="empty">点击“新建”添加第一条配置。</div>') +
        '</div></div>';
      bindRows();
      bindForm(selected);
    }

    function rowHtml(item, selected) {
      const active = selected && selected.id === item.id ? " active" : "";
      const meta = item.url || item.collectionId || item.target || item.templateId || "";
      return '<div class="row' + active + '" data-id="' + item.id + '"><div class="row-title"><span>' + escapeHtml(item.name || item.id) + '</span><span class="tag">' + escapeHtml(item.id) + '</span></div><div class="row-meta">' + escapeHtml(meta) + '</div></div>';
    }

    function formHtml(tab, item) {
      if (tab === "sources") return sourceForm(item);
      if (tab === "collections") return collectionForm(item);
      if (tab === "templates") return templateForm(item);
      return profileForm(item);
    }

    function sourceForm(item) {
      return '<form class="form" data-kind="sources">' +
        input("ID", "id", item.id) + input("名称", "name", item.name) +
        select("类型", "type", item.type, [["remote","远程 URL"],["local","本地文本"]]) +
        input("远程订阅 URL", "url", item.url || "") +
        area("本地节点文本", "content", item.content || "") +
        area("过滤器 JSON", "filters", JSON.stringify(item.filters || [], null, 2)) +
        checkbox("启用", "enabled", item.enabled !== false) + actions() + '</form>';
    }

    function collectionForm(item) {
      return '<form class="form" data-kind="collections">' +
        input("ID", "id", item.id) + input("名称", "name", item.name) +
        select("规则模板", "templateId", item.templateId, state.config.templates.map((template) => [template.id, template.name])) +
        area("订阅源 ID JSON", "sourceIds", JSON.stringify(item.sourceIds || [], null, 2)) +
        area("组合过滤器 JSON", "filters", JSON.stringify(item.filters || [], null, 2)) +
        checkbox("跳过失败的远程订阅", "ignoreFailed", item.ignoreFailed !== false) +
        checkbox("启用", "enabled", item.enabled !== false) + actions() + '</form>';
    }

    function templateForm(item) {
      return '<form class="form" data-kind="templates">' +
        input("ID", "id", item.id) + input("名称", "name", item.name) +
        select("目标格式", "target", item.target, [["mihomo","Mihomo"],["sing-box","sing-box"],["v2ray","v2ray"],["uri","URI"],["json","JSON"]]) +
        area("模板 JSON", "config", JSON.stringify(item.config || {}, null, 2)) + actions() + '</form>';
    }

    function profileForm(item) {
      const downloadToken = localStorage.getItem("substore_download_token") || "";
      const tokenQuery = downloadToken ? "?token=" + encodeURIComponent(downloadToken) : "?token=<download-token>";
      const link = location.origin + "/download/" + encodeURIComponent(item.id) + "/" + encodeURIComponent(item.target || "mihomo") + tokenQuery;
      return '<form class="form" data-kind="profiles">' +
        input("ID", "id", item.id) + input("名称", "name", item.name) +
        select("组合订阅", "collectionId", item.collectionId, state.config.collections.map((collection) => [collection.id, collection.name])) +
        select("目标格式", "target", item.target, [["mihomo","Mihomo"],["sing-box","sing-box"],["v2ray","v2ray"],["uri","URI"],["json","JSON"]]) +
        select("规则模板", "templateId", item.templateId, state.config.templates.map((template) => [template.id, template.name])) +
        checkbox("启用", "enabled", item.enabled !== false) +
        '<label>下载链接<div class="linkbox">' + escapeHtml(link) + '</div></label>' + actions() + '</form>';
    }

    function renderBackup() {
      byId("content").innerHTML = '<div class="panel"><div class="panel-header"><div class="panel-title">配置 JSON</div><div class="actions"><button id="exportBtn">刷新导出</button><button id="importBtn" class="primary">导入覆盖</button></div></div><div class="form"><textarea id="backupText">' + escapeHtml(JSON.stringify(state.config, null, 2)) + '</textarea></div></div>';
      byId("exportBtn").onclick = () => { byId("backupText").value = JSON.stringify(state.config, null, 2); };
      byId("importBtn").onclick = async () => {
        state.config = await api("/api/config", { method: "PUT", body: byId("backupText").value });
        toast("已导入");
        render();
      };
    }

    function input(labelText, name, value) {
      return '<label>' + labelText + '<input name="' + name + '" value="' + escapeAttr(value || "") + '"></label>';
    }
    function area(labelText, name, value) {
      return '<label>' + labelText + '<textarea name="' + name + '">' + escapeHtml(value || "") + '</textarea></label>';
    }
    function select(labelText, name, value, options) {
      return '<label>' + labelText + '<select name="' + name + '">' + options.map(([id, text]) => '<option value="' + escapeAttr(id) + '"' + (id === value ? " selected" : "") + '>' + escapeHtml(text) + '</option>').join("") + '</select></label>';
    }
    function checkbox(labelText, name, checked) {
      return '<label class="checkbox"><input type="checkbox" name="' + name + '"' + (checked ? " checked" : "") + '> ' + labelText + '</label>';
    }
    function actions() {
      return '<div class="footer-actions"><button type="button" class="danger" data-delete>删除</button><button class="primary">保存</button></div>';
    }

    function bindRows() {
      document.querySelectorAll(".row").forEach((row) => {
        row.onclick = () => { state.selectedId = row.dataset.id; render(); };
      });
    }

    function bindForm(selected) {
      const form = document.querySelector("form[data-kind]");
      if (!form || !selected) return;
      form.onsubmit = async (event) => {
        event.preventDefault();
        const data = formData(form);
        const kind = form.dataset.kind;
        await api("/api/" + kind + "/" + encodeURIComponent(selected.id), { method: "PUT", body: JSON.stringify(data) });
        toast("已保存");
        await load();
        state.selectedId = data.id;
        render();
      };
      const del = form.querySelector("[data-delete]");
      del.onclick = async () => {
        if (!confirm("确认删除 " + selected.id + " ?")) return;
        await api("/api/" + form.dataset.kind + "/" + encodeURIComponent(selected.id), { method: "DELETE" });
        state.selectedId = null;
        toast("已删除");
        await load();
      };
    }

    function formData(form) {
      const data = Object.fromEntries(new FormData(form).entries());
      for (const box of form.querySelectorAll('input[type="checkbox"]')) data[box.name] = box.checked;
      if ("filters" in data) data.filters = safeJson(data.filters, []);
      if ("sourceIds" in data) data.sourceIds = safeJson(data.sourceIds, []);
      if ("config" in data) data.config = safeJson(data.config, {});
      return data;
    }

    byId("refreshBtn").onclick = load;
    byId("newBtn").onclick = async () => {
      const id = prompt("ID");
      if (!id) return;
      const payload = { id, name: id };
      if (state.tab === "sources") Object.assign(payload, { type: "remote", url: "", content: "", enabled: true, filters: [] });
      if (state.tab === "collections") Object.assign(payload, { sourceIds: [], filters: [], templateId: "mihomo-basic", ignoreFailed: true, enabled: true });
      if (state.tab === "templates") Object.assign(payload, { target: "mihomo", config: {} });
      if (state.tab === "profiles") Object.assign(payload, { collectionId: "daily", target: "mihomo", templateId: "mihomo-basic", enabled: true });
      await api("/api/" + state.tab, { method: "POST", body: JSON.stringify(payload) });
      state.selectedId = id;
      await load();
    };
    document.querySelectorAll(".nav button").forEach((button) => button.onclick = () => setTab(button.dataset.tab));

    function escapeHtml(value) {
      return String(value).replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[char]));
    }
    function escapeAttr(value) { return escapeHtml(value); }

    load().catch((error) => {
      if (String(error.message).includes("token")) byId("tokenNotice").classList.remove("hidden");
      byId("content").innerHTML = '<div class="notice">' + escapeHtml(error.message) + '</div>';
    });
  </script>
</body>
</html>`;
}
