'use strict';
{
  const openFile = ({
    accept,
    multiple = false,
    delay = 300
  } = {}) => new Promise((resolve, reject) => {
    const input = document.createElement('input');

    input.type = 'file';

    if (typeof accept !== 'undefined') {
      input.accept = accept;
    }

    if (multiple) {
      input.multiple = true;
    }

    window.addEventListener('focus', () => {
      setTimeout(() => {
        const files = input.files;

        if (!files) {
          reject(new Error('Input element has no files'));

          return;
        }

        if (!files.length) {
          reject(new Error('File selection has been canceled'));

          return;
        }

        resolve(files);
      }, delay);
    }, { once: true });

    input.click();
  });

  window.openFile = openFile;
}