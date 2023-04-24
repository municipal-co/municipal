import * as findifySdk from '@findify/sdk';

const client = window.FindifyAnalytics({
  key: '2d536f4d-7970-4bf4-885e-e16f0e21ace5'
})

const sdkClient = findifySdk.init({
  key: '2d536f4d-7970-4bf4-885e-e16f0e21ace5',
  user: client.user,
  log: true,
  method: 'post'
})

export {sdkClient, client};
