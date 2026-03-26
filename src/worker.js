export default {
  async fetch(request, env) {
    return new Response("Not found response by worker", { status: 404 });
  },
};
