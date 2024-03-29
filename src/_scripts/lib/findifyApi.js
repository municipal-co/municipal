import * as findifySdk from '@findify/sdk';
let client = {
  user: {
    persists: false,
    exists: false,
    sid: 'null',
    uid: 'null'
  },
  sendEvent: function() {}
};

if(typeof window.FindifyAnalytics !== 'undefined') {
  client = window.FindifyAnalytics({
    key: '2d536f4d-7970-4bf4-885e-e16f0e21ace5',
    method: 'post',
  })
}

const sdkClient = findifySdk.init({
  key: '2d536f4d-7970-4bf4-885e-e16f0e21ace5',
  user: client?.user || null,
  log: true,
  method: 'post',
})

export {sdkClient, client};
