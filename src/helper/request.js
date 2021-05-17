import { saveAs } from 'file-saver';
import { isEmpty } from 'lodash';

export function getFileName(contentDisposition) {
  if (isEmpty(contentDisposition)) {
    return;
  }
  let indexOf = contentDisposition.indexOf('=');
  return contentDisposition.substring(indexOf + 1);
}

export async function parseFile(response) {
  let fileName = getFileName(response.headers.get('Content-Disposition'));
  let res = await response.blob();
  const blob = new Blob([res], { type: 'application/octet-stream' });
  saveAs(blob, decodeURI(fileName));
}

export async function parseFileToArrayBuffer(response) {
  return await response.arrayBuffer();
}
