(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.AshuniRebornRuntime = api;
})(typeof globalThis === 'object' ? globalThis : this, function () {
  'use strict';

  function create(manifest, pageUrl) {
    const maps = {
      'space-station': { route: 'space-station', title: 'Space Station' },
      hawaii: { route: 'hawaii', title: 'Hawaii' },
      'las-vegas': { route: 'lasvegas', title: 'Las Vegas' },
      'st-petersburg': { route: 'st-petersburg', title: 'St. Petersburg' },
      copenhagen: { route: 'copenhagen', title: 'Copenhagen' },
      'copenhagen-super-runner': { route: 'copenhagen-super-runner', title: 'Copenhagen Super Runner' },
      'sao-paulo': { route: 'sao-paulo', title: 'Sao Paulo' },
      transylvania: { route: 'transylvania', title: 'Transylvania', assetDirectory: 'transylvania-enhanced' }
    };
    const map = maps[manifest.mapSlug];
    if (!map || manifest.buildId !== 'reborn-shared-enhanced-local-20260907t045830z' || manifest.buildVersion !== 'enhanced-local-20260907t045830z' || manifest.contentHash !== manifest.mapSlug + '-unified-' + manifest.buildVersion) throw new Error('Unsupported Reborn manifest.');
    const page = new URL(pageUrl);
    const hostname = page.hostname.replace(/^\[|\]$/g, '');
    const local = /^(?:localhost|127(?:\.\d{1,3}){3}|10(?:\.\d{1,3}){3}|192\.168(?:\.\d{1,3}){2}|172\.(?:1[6-9]|2\d|3[01])(?:\.\d{1,3}){2}|::1)$/i.test(hostname) || /\.manus\.computer$/i.test(hostname);
    const vercel = page.protocol === 'https:' && hostname === 'reborn-test-phi.vercel.app';
    const hosted = page.protocol === 'https:' && (vercel || /^(?:www\.)?ashuni\.lol$/i.test(hostname) || /^(?:[a-z0-9-]+\.)?ashuni-lol\.pages\.dev$/i.test(hostname));
    if (!local && !hosted) throw new Error('Unsupported ' + map.title + ' host.');
    const requestedMode = page.searchParams.get('mode');
    const mode = requestedMode === 'training' && manifest.modes?.includes('training') ? 'training' : 'original';

    const localRoot = '/Build/' + (map.assetDirectory || map.route + '-reborn') + '/';
    const playerRoot = '/Build/space-station-reborn/';
    function assetUrl(value) {
      if (![localRoot, playerRoot].some(prefix => value.startsWith(prefix))) throw new Error('Unexpected ' + map.title + ' asset path.');
      if (!hosted || vercel) { if (value.startsWith('/Build/space-station-reborn/Build/')) return '/Build/' + value.slice('/Build/space-station-reborn/Build/'.length); return value; } return globalThis.ashuniBuildAccess.assetUrl(page.origin + '/__build_gate' + value);
    }
    const contentPrefix = '/v1/assets/reborn/content/' + manifest.mapSlug + '/' + manifest.contentHash + '/';
    const playerPrefix = '/v1/assets/builds/shared/' + manifest.buildVersion + '/';
    const catalogName = 'catalog_' + manifest.contentHash + '.bin';
    const cityDependency = new RegExp('^StreamingAssets/aa/WebGL/' + manifest.mapSlug + '_(?:monoscripts|unitybuiltinassets)_[a-f0-9]{32}\\.bundle$');
    function sharedAsset(relative) { return assetUrl((cityDependency.test(relative) ? localRoot : playerRoot) + relative); }

    function resolveRequest(value) {
      const url = new URL(value, page.href);
      const recoveredShared = '/builds/shared/' + manifest.buildVersion + '/';
      const recoveredContent = '/reborn/content/' + manifest.mapSlug + '/' + manifest.contentHash + '/';
      if (url.protocol === 'https:' && url.hostname === 'assets.tavvkkj.xyz' && url.pathname.startsWith(recoveredContent)) {
        const relative = url.pathname.slice(recoveredContent.length);
        if (/^(?:[a-f0-9]{32}\.bundle|catalog_[a-z0-9-]+\.(?:bin|hash))$/.test(relative)) return assetUrl(localRoot + 'content/' + relative);
        throw new Error('Unknown recovered city asset.');
      }
      if (url.protocol === 'https:' && url.hostname === 'assets.tavvkkj.xyz' && url.pathname.startsWith(recoveredShared)) {
        const relative = url.pathname.slice(recoveredShared.length);
        if (cityDependency.test(relative) || /^(?:CharacterPacks\/[a-f0-9]{32}|StreamingAssets\/aa\/WebGL\/(?:[a-f0-9]{32}|[a-f0-9]{32}_(?:monoscripts|unitybuiltinassets)_[a-f0-9]{32}))\.bundle$/.test(relative)) return sharedAsset(relative);
        throw new Error('Unknown recovered character asset.');
      }
      if ((url.origin === page.origin || hosted && url.origin === 'https://builds.ashuni.lol') && url.pathname.replace(/^\/__build_gate/, '').startsWith(playerRoot)) {
        const relative = url.pathname.replace(/^\/__build_gate/, '').slice(playerRoot.length);
        if (cityDependency.test(relative)) return sharedAsset(relative);
      }
      if (!['127.0.0.1', 'localhost', '[::1]'].includes(url.hostname) || url.port !== '49371') return hosted && !vercel ? globalThis.ashuniBuildAccess.assetUrl(value) : value;
      let target;
      if (url.pathname.startsWith(contentPrefix)) target = localRoot + 'content/' + url.pathname.slice(contentPrefix.length);
      else if (url.pathname.startsWith(playerPrefix)) return sharedAsset(url.pathname.slice(playerPrefix.length)) + url.search;
      else throw new Error('Unknown Space Station virtual asset: ' + url.pathname);
      return assetUrl(target) + url.search;
    }

    function patchFramework(source) {
      function replaceOnce(from, to, label) {
        if (source.split(from).length !== 2) throw new Error('Unsupported Space Station ' + label + ' bridge.');
        source = source.replace(from, to);
      }
      replaceOnce('SendMessage(objectName,successMethod,"LOCAL|"+nonce+', 'SendMessage(objectName,"AuthorizeLocalPayload",nonce+', 'activation');
      replaceOnce('var host=String(globalThis.location&&globalThis.location.hostname||"").replace(/^\\[|\\]$/g,"");', 'var host="localhost";', 'activation host');
      for (const [name, value] of Object.entries({ Host: 'localhost:5173', Href: 'http://localhost:5173/' + map.route + '/', Origin: 'http://localhost:5173' })) {
        const original = 'function _ReconstructedRuntimeGetLocation' + name + '(){return stringToNewUTF8(String(window.location&&window.location.' + name.toLowerCase() + '||""))}';
        replaceOnce(original, 'function _ReconstructedRuntimeGetLocation' + name + '(){return stringToNewUTF8(' + JSON.stringify(value) + ')}', 'runtime location ' + name);
      }
      // Keep the validated virtual receipt URI inside Unity, but never fetch loopback on a visitor's PC.
      replaceOnce('function _JS_WebRequest_Create(url,method){var _url=UTF8ToString(url);', 'function _JS_WebRequest_Create(url,method){var _url=Module.ashuniResolveAssetUrl(UTF8ToString(url));', 'asset transport');
      replaceOnce('function _TavvkkjEnvRoute(){try{globalThis.location.assign("https://"+["tavvkkj","xyz"].join("."))}catch(e){globalThis.open("https://"+["tavvkkj","xyz"].join("."),"_self")}}', 'function _TavvkkjEnvRoute(){}', 'navigation');
      replaceOnce('function _JS_Eval_OpenURL(ptr){var str=UTF8ToString(ptr);window.open(str,"_blank","")}', 'function _JS_Eval_OpenURL(ptr){var str=UTF8ToString(ptr);if(!str.trim())return;try{var url=new URL(str,globalThis.location.href);if(/(^|\\.)tavvkkj\\.xyz$/i.test(url.hostname)||/(^|\\.)tiktok\\.com$/i.test(url.hostname)&&/^\\/@tavvkkj(?:\\/|$)/i.test(url.pathname))return}catch(error){}window.open(str,"_blank","")}', 'promotional links');
      replaceOnce('function _JS_Log_Dump(ptr,type){var str=UTF8ToString(ptr);if(typeof dump=="function")dump(str);switch(type){case 0:case 1:case 4:console.error(str);return;case 2:console.warn(str);return;case 3:case 5:console.log(str);return;default:console.error("Unknown console message type!");console.error(str)}}', 'function _JS_Log_Dump(ptr,type){Module.ashuniRuntimeHealth.nativeLog(UTF8ToString(ptr),type)}', 'native logging');
      replaceOnce('var ret=GLctx.getInternalformatParameter(target,internalformat,pname);', 'var ret=Module.ashuniRuntimeHealth.getInternalformatParameter(GLctx,target,internalformat,pname);', 'renderbuffer capabilities');
      replaceOnce('WEBAudio.audioContext=new AudioContext;', 'WEBAudio.audioContext=new AudioContext;Module.ashuniRuntimeHealth.prepareAudio(WEBAudio.audioContext,Module);', 'audio preparation');
      replaceOnce('var tryToResumeAudioContext=function(){if(WEBAudio.audioContext.state==="suspended")WEBAudio.audioContext.resume().catch(function(error){console.warn("Could not resume audio context. Exception: "+error)});else Module.clearInterval(resumeInterval)};var resumeInterval=Module.setInterval(tryToResumeAudioContext,400);', '', 'audio polling');
      replaceOnce('var _userEventCallback=function(){try{if(WEBAudio.audioContext.state!=="running"&&WEBAudio.audioContext.state!=="closed"){WEBAudio.audioContext.resume().catch(function(error){console.warn("Could not resume audio context. Exception: "+error)})}', 'var _userEventCallback=function(event){if(event&&event.isTrusted===false)return;try{Module.ashuniRuntimeHealth.resumeAudio(WEBAudio.audioContext,true);', 'gesture audio resume');
      replaceOnce('function _JS_Sound_ResumeIfNeeded(){if(WEBAudio.audioWebEnabled==0)return;if(WEBAudio.audioContext.state==="suspended")WEBAudio.audioContext.resume().catch(function(error){console.warn("Could not resume audio context. Exception: "+error)})}', 'function _JS_Sound_ResumeIfNeeded(){if(WEBAudio.audioWebEnabled==0)return;Module.ashuniRuntimeHealth.resumeAudio(WEBAudio.audioContext)}', 'native audio resume');
      replaceOnce('console.log("Audio context resumed after "+WEBAudio.audioContextResumeOffset.toFixed(3)+" seconds.");', 'Module.ashuniRuntimeHealth.log("info","Audio context resumed.");', 'audio startup log');
      const metadataLog = 'console.log("Trying to get metadata of sound which is not loaded.");';
      if (source.split(metadataLog).length !== 3) throw new Error('Unsupported Reborn audio metadata bridge.');
      source = source.split(metadataLog).join('Module.ashuniRuntimeHealth.pendingAudioMetadata(this);');
      replaceOnce('console.log("Decode error: "+_error)', 'Module.ashuniRuntimeHealth.log("error","Audio decode failed: "+_error)', 'audio decode errors');
      replaceOnce('console.warn("Manual synchronization of Unity Application.persistentDataPath via JS_FileSystem_Sync() is deprecated and will be later removed in a future Unity version. The persistent data directory will be automatically synchronized instead on file modification. Pass config.autoSyncPersistentDataPath = true; to configuration in createUnityInstance() to opt in to the new behavior.")', 'Module.ashuniRuntimeHealth.persistenceNotice()', 'persistence notice');
      return source;
    }

    return {
      hosted,
      mode,
      assetRoots: [...new Set([localRoot, playerRoot])],
      catalogUrl: 'http://127.0.0.1:49371' + contentPrefix + catalogName,
      assetUrl,
      resolveRequest,
      patchFramework
    };
  }

  function applyRuntimeEvent(state, type) {
    state.lastRuntimeEvent = type;
    state.runtimeEvents.push(type);
    if (state.runtimeEvents.length > 50) state.runtimeEvents.shift();
    if (type === 'reborn:menuShown') { state.ready = true; state.phase = 'menu'; state.paused = false; }
    if (['reborn:runStarted', 'reborn:runResumed', 'reborn:resume'].includes(type)) { state.ready = true; state.phase = 'running'; state.paused = false; }
    if (['reborn:pause', 'reborn:playerDied', 'reborn:saveMeShown', 'reborn:gameEnded', 'reborn:runEnded'].includes(type)) state.paused = true;
  }

  function canUseNewTouch(state) { return state.ready && state.phase === 'running' && !state.paused; }

  return { create, applyRuntimeEvent, canUseNewTouch };
});
