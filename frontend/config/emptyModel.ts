// Stub model rỗng — thay cho các useModel model admin KHI build landing
// (APP_CONFIG_TARGET=landing). Plugin-model import tĩnh mọi model vào Provider
// global, nên không thể tree-shake theo route; ta thay bằng module rỗng để webpack
// loại code model admin + service API mà chúng kéo theo khỏi bundle landing.
// Landing không gọi useModel của các namespace này nên trả {} là an toàn.
export default () => ({});
