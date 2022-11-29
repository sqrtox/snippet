'use strict';
{
  const acceptInput = document.getElementById('accept-input');
  const multipleCheckbox = document.getElementById('multiple-checkbox');
  const result = document.getElementById('result');
  const delayInput = document.getElementById('delay-input');

  if (localStorage.getItem('acceptInput')) {
    acceptInput.value = localStorage.getItem('acceptInput');
  }


  if (localStorage.getItem('multipleCheckbox')) {
    multipleCheckbox.checked = localStorage.getItem('multipleCheckbox') === 'true';
  }

  if (localStorage.getItem('delayInput')) {
    delayInput.value = localStorage.getItem('delayInput');
  }

  multipleCheckbox.addEventListener('change', () => {
    localStorage.setItem('multipleCheckbox', delayInput.value ? 'true' : 'false');
  })


  acceptInput.addEventListener('input', () => {
    localStorage.setItem('acceptInput', acceptInput.value);
  })

  delayInput.addEventListener('change', () => {
    localStorage.setItem('delayInput', delayInput.value);
  })

  const setResult = (type, files) => {
    switch (type) {
      case 'clear': {
        result.innerHTML = "";

        break;
      }

      case 'success': {
        const successText = document.createElement('p');

        successText.innerText = `${files.length}件のファイルが選択されました`;
        successText.classList.add('success-text');

        result.append(successText);

        const filesTable = document.createElement('table');
        const filesTbody = document.createElement('tbody');

        filesTable.append(filesTbody);

        const tr = document.createElement('tr');

        filesTbody.append(tr);

        const nameTh = document.createElement('th');

        nameTh.innerText = 'name';

        tr.append(nameTh);

        const sizeTh = document.createElement('th');

        sizeTh.innerText = 'size';

        tr.append(sizeTh);

        const typeTh = document.createElement('th');

        typeTh.innerText = 'type';

        tr.append(typeTh);

        for (const f of files) {
          const t = document.createElement('tr');

          const nameTd = document.createElement('td');

          nameTd.innerText = f.name;

          t.append(nameTd);

          const sizeTd = document.createElement('td');

          sizeTd.innerText = f.size;

          t.append(sizeTd);


          const typeTd = document.createElement('td');

          typeTd.innerText = f.type;

          t.append(typeTd);


          filesTbody.append(t);
        }

        result.append(filesTable);

        break;
      }

      case 'error': {
        const errText = document.createElement('p');

        errText.innerText = 'キャンセルしました';
        errText.classList.add('error-text');

        result.append(errText);

        break;
      }
    }
  };

  document.getElementById('clear-result-button').addEventListener('click', () => {
    setResult('clear');
  })

  document.getElementById('open-file-button').addEventListener('click', async () => {
    setResult('clear');

    try {
      const files = await openFile({
        accept: acceptInput.value,
        multiple: multipleCheckbox.checked,
        delay: parseInt(delayInput.value, 10)
      });

      console.log(files);

      setResult('success', files);
    } catch (err) {
      setResult('error');
    }
  });
}