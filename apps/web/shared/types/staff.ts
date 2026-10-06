/** Someone who serves the church, as the contact page's front matter lists them. */
export interface StaffMember {
  name: string;
  /** What they do: `Elder`, `Pastor`, `Office Administrator`. */
  role: string;
  /** A few words about them. */
  bio?: string;
  /** The path of their photo, under the site's media. */
  photo?: string;
  email?: string;
}
