import React, { useEffect } from "react";

const FindifyTotalCount = (props) => {

  useEffect(() => {
    document.title = `Search: ${props.count} results ${props.query ? `for "${props.query}" ` : ""}| MUNICIPAL`
  }, [props.count])

  return(
    <p className="findify-result-summary">
      Showing {props.count} results {props.query && `for "${props.query}"`}
    </p>
  )
}

export default FindifyTotalCount;
