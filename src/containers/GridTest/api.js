import request from '../../utils/request';
import { API_ADDRESS } from '../../constants/config';
import { HTTP_METHOD } from '../../constants/networking';

export const fetchPrList = (id, version) =>
  request({
    url: `${API_ADDRESS}/pr-lists/${id}?version=${version}`,
    options: {
      method: HTTP_METHOD.GET,
    },
  });

export const fetchPrsByPaging = (params) => {
  const { prListId, lastReleaseVersion, version, ...otherProps } = params;
  return request({
    url: `${API_ADDRESS}/prs?prListId=${prListId}&lastReleaseVersion=${lastReleaseVersion}&version=${version}`,
    options: {
      method: HTTP_METHOD.POST,
      body: JSON.stringify(otherProps),
    },
  });
};

export const fetchTemplateConfig = (prListId) => {
  return request({
    url: `${API_ADDRESS}/pr-list-templatems/config?prListId=${prListId}`,
    options: {
      method: HTTP_METHOD.GET,
    },
  });
};

export const updatePrs = (prListId, params) => {
  return request({
    url: `${API_ADDRESS}/prs/patch-update?prListId=${prListId}`,
    options: {
      method: HTTP_METHOD.POST,
      body: JSON.stringify(params),
    },
  });
};

export const fetchCurrentPrs = (params) => {
  const { prListId, lastReleaseVersion, version, ...otherProps } = params;
  return request(
    `${API_ADDRESS}/prs?prListId=${prListId}&lastReleaseVersion=${lastReleaseVersion}&version=${version}`,
    {
      method: HTTP_METHOD.POST,
      body: JSON.stringify(otherProps),
    }
  );
};
