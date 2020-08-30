import React from "react";
import { useLocation, useHistory, useRouteMatch } from "react-router-dom";
import LZString from "lz-string";

import CalendarPage from "./CalendarPage";

// TODO: compare other ways of compressing json into URI param
// other packages that can do this include: json-url, jsoncrush, protobufjs, urlon
// check for too long url if we find a limit

const latestVersion = "v1";

function encode(data) {
  const params = LZString.compressToEncodedURIComponent(JSON.stringify(data));
  return params;
}

function decode(params, version = latestVersion) {
  if (version !== latestVersion) {
    throw new Error(`Unsupported version ${version}`);
  }
  // n = name of calendar, u = users (strings), a = appointments, l = last edited, ui = user id (-1 is anonymous), t = timestamp
  let data = {
    // n: "",
    a: [],
    // u: [],
    // l: "",
  };
  if (params) {
    data = JSON.parse(LZString.decompressFromEncodedURIComponent(params));
  }
  if (
    !data ||
    !data.a ||
    // !data.u ||
    !Array.isArray(data.a) // ||
    // !Array.isArray(data.u)
  ) {
    // TODO: add more checks or drop unused parts of the JSON?
    throw new Error("Invalid params payload");
  }
  return data;
}

function QueryParser() {
  const location = useLocation();
  const history = useHistory();
  const matchVersion = useRouteMatch({
    path: "/:v",
    exact: true,
    sensitive: true,
    strict: true,
  });

  let data;
  try {
    let params = location.search.substring(1);
    const version = matchVersion?.params?.v;
    if (version !== latestVersion) {
      params = encode(decode(params, version));
      history.push(`/${latestVersion}?${params}`);
      return null;
    }
    data = decode(params);
  } catch (e) {
    // console.error(e);
    history.push(`/${latestVersion}?`);
    return null;
  }

  function setData(data) {
    data.l = new Date();
    const params = encode(data);
    history.push(`/${latestVersion}?${params}`);
  }

  return <CalendarPage data={data} setData={setData} />;
}

export default QueryParser;
