import { useEffect } from "react";
import { useLocation } from "react-router-dom";

/**
 * React Router doesn't reset scroll position between route changes — that's
 * a holdover from traditional multi-page navigation that SPAs don't get for
 * free. Without this, clicking a Similar Movies card (or any link) partway
 * down a long page leaves the browser at the same scroll offset on the new
 * page, which can land anywhere depending on how tall the new page is.
 */
export default function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}
