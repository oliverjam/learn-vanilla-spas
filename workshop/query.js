function query(url, options) {
  return fetch(url, options).then((res) => {
    if (!res.ok) {
      const error = new Error("HTTP Error");
      error.status = res.status;
      throw error;
    }
    const contentType = res.headers.get("content-type");
    if (contentType && contentType.includes("json")) {
      return res.json();
    } else {
      return res.text();
    }
  });
}

export default query;
