import { createSiteThemeHandler } from "../../aurora";

/**
 * The theme catalog: the site's own theme and all of aurora's, over the
 * catalog wire protocol — listings at `/api/untheme/themes`, layers at
 * `/api/untheme/themes/:id`. This file's folder is the base the catalog
 * client points at.
 */
export default createSiteThemeHandler();
