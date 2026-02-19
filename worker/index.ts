export { VoiceRoom } from '../src/durable-objects/VoiceRoom';

export default {
  async fetch() {
    return new Response('Voice Room DO Worker', { status: 200 });
  },
};
