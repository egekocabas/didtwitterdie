const repositoryUrl = __REPOSITORY_URL__;
const buildSha = __BUILD_SHA__ || "";
const buildTime = __BUILD_TIME__ || "";

export const buildInfo = {
  repositoryUrl,
  buildSha: buildSha || null,
  buildTime: buildTime || null,
  shortBuildSha: buildSha ? buildSha.slice(0, 7) : null,
  commitUrl: buildSha ? `${repositoryUrl}/commit/${buildSha}` : repositoryUrl,
};
