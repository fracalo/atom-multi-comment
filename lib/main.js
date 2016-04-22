'use babel';
import MultiComment from './multi-comment';

export default {
  activate: () => {
    this.multiComment = new MultiComment();
  },
  deactivate: () => {
    if (this.multiComment) this.multiComment.destroy();
    this.multiComment = null;
  }
};
