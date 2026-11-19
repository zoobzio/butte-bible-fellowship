import type { z } from "zod";

import type { aboutArticle, aboutBody, aboutForm } from "./input/about";
import type { appearanceBody, appearanceForm } from "./input/appearance";
import type { connectArticle, connectBody, connectForm } from "./input/connect";
import type {
  contentArticle,
  contentBody,
  contentDraft,
  contentForm,
  contentId,
  contentPath,
  contentPlacement,
  contentQuery,
  contentSort,
} from "./input/content";
import type {
  eventArticle,
  eventBody,
  eventForm,
  eventId,
  eventPath,
  eventQuery,
  eventSort,
  eventWindow,
  eventsQuery,
} from "./input/event";
import type {
  folderBody,
  folderDraft,
  folderId,
  folderPlacement,
  folderSort,
  foldersQuery,
} from "./input/folder";
import type { homeArticle, homeBody, homeForm, homeImage } from "./input/home";
import type { listingQuery, sortDirection } from "./input/listing";
import type {
  DATE_OPERATORS,
  MATCH_OPERATORS,
  TEXT_OPERATORS,
} from "./input/operators";
import type { sermonBody, sermonPath, sermonsQuery } from "./input/sermon";
import type {
  staffBio,
  staffBody,
  staffForm,
  staffId,
  staffQuery,
  staffSort,
} from "./input/staff";
import type {
  contentView,
  contentViewBody,
  eventView,
  eventViewBody,
  staffView,
  staffViewBody,
  viewList,
  viewPath,
} from "./input/view";
import type { aboutRecord } from "./models/about";
import type {
  appearance,
  appearanceInput,
  appearanceRecord,
  appearanceSeeds,
} from "./models/appearance";
import type { connectPage, connectRecord } from "./models/connect";
import type { contentRecord, contentRecords, mime } from "./models/content";
import type {
  churchEvent,
  churchEvents,
  eventDay,
  eventListing,
  eventRecord,
  eventRecords,
  eventTime,
} from "./models/event";
import type { folderRecord, folderRecords } from "./models/folder";
import type { hast, hastElement, hastText } from "./models/hast";
import type { homeHero, homePage, homeRecord } from "./models/home";
import type { link } from "./models/link";
import type { page } from "./models/page";
import type { sermon, sermons } from "./models/sermon";
import type { slug } from "./models/slug";
import type {
  staffListing,
  staffMember,
  staffMembers,
  staffRecord,
  staffRole,
} from "./models/staff";
import type { contentStatus } from "./models/status";
import type { viewRecord, viewRecords, viewSurface } from "./models/view";

export type Slug = z.infer<typeof slug>;

export type EventDay = z.infer<typeof eventDay>;

export type EventTime = z.infer<typeof eventTime>;

export type ChurchEvent = z.infer<typeof churchEvent>;

export type ChurchEvents = z.infer<typeof churchEvents>;

export type EventRecord = z.infer<typeof eventRecord>;

export type EventListing = z.infer<typeof eventListing>;

export type EventRecords = z.infer<typeof eventRecords>;

export type Hast = z.infer<typeof hast>;

export type HastElement = z.infer<typeof hastElement>;

export type HastText = z.infer<typeof hastText>;

export type ContentStatus = z.infer<typeof contentStatus>;

export type StaffRole = z.infer<typeof staffRole>;

export type StaffMember = z.infer<typeof staffMember>;

export type StaffMembers = z.infer<typeof staffMembers>;

export type StaffRecord = z.infer<typeof staffRecord>;

export type StaffListing = z.infer<typeof staffListing>;

export type Sermon = z.infer<typeof sermon>;

export type Sermons = z.infer<typeof sermons>;

export type Page = z.infer<typeof page>;

export type Link = z.infer<typeof link>;

export type HomeHero = z.infer<typeof homeHero>;

export type HomePage = z.infer<typeof homePage>;

export type HomeRecord = z.infer<typeof homeRecord>;

export type HomeBody = z.infer<typeof homeBody>;

export type HomeForm = z.infer<typeof homeForm>;

export type HomeArticle = z.infer<typeof homeArticle>;

export type HomeImage = z.infer<typeof homeImage>;

export type AboutRecord = z.infer<typeof aboutRecord>;

export type AboutBody = z.infer<typeof aboutBody>;

export type AboutForm = z.infer<typeof aboutForm>;

export type AboutArticle = z.infer<typeof aboutArticle>;

export type Appearance = z.infer<typeof appearance>;

export type AppearanceSeeds = z.infer<typeof appearanceSeeds>;

export type AppearanceInput = z.infer<typeof appearanceInput>;

export type AppearanceRecord = z.infer<typeof appearanceRecord>;

export type AppearanceBody = z.infer<typeof appearanceBody>;

export type AppearanceForm = z.infer<typeof appearanceForm>;

export type ConnectPage = z.infer<typeof connectPage>;

export type ConnectRecord = z.infer<typeof connectRecord>;

export type ConnectBody = z.infer<typeof connectBody>;

export type ConnectForm = z.infer<typeof connectForm>;

export type ConnectArticle = z.infer<typeof connectArticle>;

export type Mime = z.infer<typeof mime>;

export type ContentRecord = z.infer<typeof contentRecord>;

export type ContentRecords = z.infer<typeof contentRecords>;

export type ContentPath = z.infer<typeof contentPath>;

export type ContentId = z.infer<typeof contentId>;

export type ContentSort = z.infer<typeof contentSort>;

export type ContentQuery = z.infer<typeof contentQuery>;

export type ContentBody = z.infer<typeof contentBody>;

export type ContentForm = z.infer<typeof contentForm>;

export type ContentArticle = z.infer<typeof contentArticle>;

export type ContentPlacement = z.infer<typeof contentPlacement>;

export type ContentDraft = z.infer<typeof contentDraft>;

export type FolderRecord = z.infer<typeof folderRecord>;

export type FolderRecords = z.infer<typeof folderRecords>;

export type FolderId = z.infer<typeof folderId>;

export type FolderSort = z.infer<typeof folderSort>;

export type FoldersQuery = z.infer<typeof foldersQuery>;

export type FolderBody = z.infer<typeof folderBody>;

export type FolderPlacement = z.infer<typeof folderPlacement>;

export type FolderDraft = z.infer<typeof folderDraft>;

export type EventPath = z.infer<typeof eventPath>;

export type EventId = z.infer<typeof eventId>;

export type EventsQuery = z.infer<typeof eventsQuery>;

export type ListingQuery = z.infer<typeof listingQuery>;

export type SortDirection = z.infer<typeof sortDirection>;

export type TextOperator = keyof typeof TEXT_OPERATORS;

export type DateOperator = keyof typeof DATE_OPERATORS;

export type MatchOperator = keyof typeof MATCH_OPERATORS;

export type EventBody = z.infer<typeof eventBody>;

export type EventForm = z.infer<typeof eventForm>;

export type EventArticle = z.infer<typeof eventArticle>;

export type EventSort = z.infer<typeof eventSort>;

export type EventQuery = z.infer<typeof eventQuery>;

export type EventWindow = z.infer<typeof eventWindow>;

export type StaffId = z.infer<typeof staffId>;

export type StaffSort = z.infer<typeof staffSort>;

export type StaffQuery = z.infer<typeof staffQuery>;

export type StaffBody = z.infer<typeof staffBody>;

export type StaffForm = z.infer<typeof staffForm>;

export type StaffBio = z.infer<typeof staffBio>;

export type SermonPath = z.infer<typeof sermonPath>;

export type SermonsQuery = z.infer<typeof sermonsQuery>;

export type SermonBody = z.infer<typeof sermonBody>;

export type ViewSurface = z.infer<typeof viewSurface>;

export type ViewRecord = z.infer<typeof viewRecord>;

export type ViewRecords = z.infer<typeof viewRecords>;

export type ViewList = z.infer<typeof viewList>;

export type ViewPath = z.infer<typeof viewPath>;

/** A view as a save carries it, whatever its list: the payload as its schema left it. */
export interface ViewBody {
  name: string;
  payload: unknown;
}

export type StaffView = z.infer<typeof staffView>;

export type StaffViewBody = z.infer<typeof staffViewBody>;

export type ContentView = z.infer<typeof contentView>;

export type ContentViewBody = z.infer<typeof contentViewBody>;

export type EventView = z.infer<typeof eventView>;

export type EventViewBody = z.infer<typeof eventViewBody>;
