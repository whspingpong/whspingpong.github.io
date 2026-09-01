/* =========================================================================
   data.js  |  WOODINVILLE HIGH SCHOOL PING PONG CLUB
   =========================================================================

   This file was written by the officer editor at admin.html
   Last updated: 9/1/2026, 1:50:19 PM

   You can edit it by hand, but the editor is safer because it cannot
   produce a typo that breaks the site.
   ====================================================================== */


/* -------------------------------------------------------------------------
   1. CLUB INFO AND CONTACT
   ---------------------------------------------------------------------- */
const CLUB = {
  school:    "Woodinville High School",
  name:      "Ping Pong Club",
  fullName:  "Woodinville High School Ping Pong Club",
  shortName: "WHS Ping Pong",
  founded:   2022,

  tagline:   "Reigning Washington state champions and national silver medalists.",

  intro:     "We're a student run ping pong club at Woodinville High School, open to everyone from people who have never picked up a paddle to players heading to nationals. Show up on Wednesday, play some ping pong, and stick around if you want to get good.",

  discord:   "https://discord.gg/7hutc5BYZ7",
  instagram: "whs.ping.pong",
  email:     "whspingpong5@gmail.com"
};


/* -------------------------------------------------------------------------
   2. HISTORY
   The timeline on the home page. Newest first.
   ---------------------------------------------------------------------- */
const HISTORY = [
  {
    year:      "2026",
    title:     "2nd at Nationals",
    text:      "Our top four travelled to Malden, Massachusetts for the AYTTO All American National Championships and brought home silver, the club's first national medal.",
    highlight: true
  },
  {
    year:      "2026",
    title:     "State champions",
    text:      "We won the Washington High School Table Tennis Team Championships at Hazen High School, going undefeated through the bracket and qualifying for nationals.",
    highlight: true
  },
  {
    year:      "2022",
    title:     "Club founded",
    text:      "The Ping Pong Club started at Woodinville High School with a handful of players and a couple of tables.",
    highlight: false
  }
];


/* -------------------------------------------------------------------------
   3. OFFICERS
   The only people allowed to take out or keep out tables.
   ---------------------------------------------------------------------- */
const OFFICERS = [
  { name: "Terrance Lam" },
  { name: "Sumarth Parmar" },
  { name: "Daniel Lazar" },
  { name: "Joshua Yen" },
  { name: "Tobin Hunt" }
];


/* -------------------------------------------------------------------------
   4. SCHEDULE
   visible: true   shows the day on the website
   visible: false  hides it completely, nobody can see it
   
   types: meeting, training, tournament, event
   ---------------------------------------------------------------------- */
const SCHEDULE = [
  {
    date:    "2026-09-02",
    type:    "meeting",
    title:   "First Club Meeting",
    time:    "After school",
    place:   "E Building",
    visible: true,
    note:    "First day of school and our first meeting. Just show up. No experience needed, no sign up, nothing to bring. All tables are first to 5 rotation."
  },
  {
    date:    "2026-09-03",
    type:    "training",
    title:   "Training Day",
    time:    "After school",
    place:   "E Building",
    visible: true,
    note:    "Drills and match practice for varsity and JV. All are welcome, but come ready to work. Required if you want to keep a rented paddle."
  },
  {
    date:    "2026-09-04",
    type:    "training",
    title:   "Training Day",
    time:    "After school",
    place:   "E Building",
    visible: true,
    note:    "Second training day of the week."
  },
  {
    date:    "2026-09-09",
    type:    "meeting",
    title:   "Club Meeting",
    time:    "After school",
    place:   "E Building",
    visible: true,
    note:    "Open play, first to 5 rotation on every table."
  },
  {
    date:    "2026-09-16",
    type:    "tournament",
    title:   "In Club Tournament",
    time:    "After school",
    place:   "E Building",
    visible: false,
    note:    "Skill matched brackets, singles or doubles, with prizes for the winners. Runs during the first quarter of the meeting, then open play after."
  }
];

const SCHEDULE_NOTE =
  "Wednesdays are our regular club meeting, open to anyone, just show up. Every other week the first quarter of the meeting is an in club tournament. Training days are separate and get posted at least a week ahead, so check back each weekend to see what's on for the coming week.";


/* -------------------------------------------------------------------------
   5. TOURNAMENTS
   Newest first. The top two get the photo feeds on the home page.
   rank: 1 gold, 2 silver, 3 bronze, 0 for no medal.
   ---------------------------------------------------------------------- */
const TOURNAMENTS = [
  {
    id:        "nationals-2026",
    name:      "AYTTO All American National Table Tennis Tournament",
    short:     "Nationals 2026",
    level:     "National",
    date:      "2026-05-24",
    time:      "All day",
    venue:     "Malden High School",
    location:  "Malden, Massachusetts",
    placement: "2nd Place",
    rank:      2,

    about:       "The AYTTO All American National High School Championships is the biggest high school table tennis event in the country, bringing together state champions and top qualifying teams from across the United States. We sent our top four players.",
    performance: "Silver medal in our first ever appearance at nationals. We came through the bracket and reached the final, where we fell just short of the title."
  },
  {
    id:        "state-2026",
    name:      "2026 Washington High School Table Tennis Team Championships",
    short:     "State 2026",
    level:     "State",
    date:      "2026-03-01",
    time:      "All day",
    venue:     "Hazen High School",
    location:  "Renton, Washington",
    placement: "1st Place",
    rank:      1,

    about:       "Washington's official high school table tennis team championship, where schools from across the state field their top eight players in a team format. Finishing in the top two qualifies a team for the AYTTO National High School Championships.",
    performance: "State champions. We went undefeated through the entire bracket, took the title, and punched our ticket to nationals."
  }
];


/* -------------------------------------------------------------------------
   6. PHOTOS
   file is the image name with no .jpg on the end.
   An empty file shows a grey coming soon tile.
   ---------------------------------------------------------------------- */
const PHOTOS = [
  { file: "nationals-2026-team", tournament: "nationals-2026", featured: true,
    caption: "The AYTTO Nationals 2026 field at Malden High School" },
  { file: null, tournament: "nationals-2026", featured: false,
    caption: "Nationals photo coming soon" },
  { file: null, tournament: "nationals-2026", featured: false,
    caption: "Nationals photo coming soon" },
  { file: null, tournament: "nationals-2026", featured: false,
    caption: "Nationals photo coming soon" },
  { file: null, tournament: "nationals-2026", featured: false,
    caption: "Nationals photo coming soon" },
  { file: "state-2026-042", tournament: "state-2026", featured: true,
    caption: "Match play at the 2026 State Championships" },
  { file: "state-2026-113", tournament: "state-2026", featured: true,
    caption: "Mid rally at the State Championships" },
  { file: "state-2026-125", tournament: "state-2026", featured: true,
    caption: "State Championships at Hazen High School" },
  { file: null, tournament: "state-2026", featured: false,
    caption: "State photo coming soon" },
  { file: null, tournament: "state-2026", featured: false,
    caption: "State photo coming soon" }
];


/* -------------------------------------------------------------------------
   7. VIDEOS
   youtubeId is just the ID from the YouTube link, not the whole link.
   The video must be Public or Unlisted.
   ---------------------------------------------------------------------- */
const VIDEOS = [
  { tournament: "nationals-2026", youtubeId: "",
    title: "Nationals 2026 final highlights" },
  { tournament: "nationals-2026", youtubeId: "",
    title: "Nationals 2026 team recap" },
  { tournament: "state-2026", youtubeId: "",
    title: "State 2026 championship point" },
  { tournament: "state-2026", youtubeId: "",
    title: "State 2026 full team highlights" }
];


/* -------------------------------------------------------------------------
   8. RULES
   ---------------------------------------------------------------------- */
const RULES = [
  { text: "You break it, you buy it." },
  { text: "No taking out <strong>any</strong> equipment without an officer approving it, and that includes the tables." },
  { text: "During Wednesday meetings, every table is first to 5 rotation. Winners stay on for a maximum of 3 wins, then rotate out on the 4th." },
  { text: "Don't be an idiot. Respect the gym, the gear, and everyone playing in it." },
  { text: "Breaking a rule can result in an infraction, a charge, or both." }
];


/* -------------------------------------------------------------------------
   9. PADDLE RENTALS
   The green box on the Rules and Info page.
   ---------------------------------------------------------------------- */
const PADDLE_RENTAL = {
  title: "We rent out Butterfly paddles",
  intro: "You do not need to buy your own gear to start. We keep a set of Butterfly paddles that members can borrow and take home, so you can train on off days with a proper bat instead of a school paddle.",
  points: [
    { lead: "Who can get one",
      text: "Any member. Come talk to an officer at a Wednesday meeting or a training day." },
    { lead: "What it costs",
      text: "Nothing. Just look after it and bring it to sessions." },
    { lead: "How you keep it",
      text: "Show up to training days. If you stop coming, the paddle gets passed on to a member who is putting the work in." }
  ]
};


/* -------------------------------------------------------------------------
   10. INFO SECTIONS
   The cards on the Rules and Info page.
   Each point is a short bold lead plus the detail.
   ---------------------------------------------------------------------- */
const INFO_SECTIONS = [
  {
    icon:  "&#128170;",
    title: "Training days",
    intro: "Separate from Wednesday meetings, and built for players who actually want to get better.",
    points: [
      { lead: "Posted a week ahead",
        text: "Check the <a href=\"schedule.html\">schedule</a> over the weekend to see what's on for the coming week." },
      { lead: "Everyone is welcome",
        text: "But a certain standard is expected as the year goes on." },
      { lead: "Do not expect this to be easy",
        text: "This is a sport like any other. It takes training, studying and consistency." },
      { lead: "Main two tables",
        text: "Match practice, third ball training, serve and receive." },
      { lead: "Back two tables",
        text: "Multiball, robot and return board training." },
      { lead: "Required for rentals",
        text: "If you want to keep a rented paddle, you have to show up to these." }
    ]
  },
  {
    icon:  "&#127942;",
    title: "Tournaments and events",
    intro: "There is always something to compete in, whatever your level.",
    points: [
      { lead: "Every other week",
        text: "An in club tournament, with players paired against others around their own skill level. Worth entering no matter how long you have been playing." },
      { lead: "Singles or doubles",
        text: "Format changes week to week, and there are prizes, including food." },
      { lead: "Extra events",
        text: "Daniel organises minigames, matches against other schools and opens for all levels. They all get posted on the <a href=\"schedule.html\">schedule</a>." },
      { lead: "State championships",
        text: "We field our top 8 players at the Washington High School Table Tennis Team Championships. As reigning champions we expect a finalist spot at minimum." },
      { lead: "Nationals",
        text: "Finishing top two at state qualifies us for the AYTTO National High School Championships, where we take our top 4 players." }
    ]
  },
  {
    icon:  "&#127933;",
    title: "Gear",
    intro: "We have just bought new equipment, with more coming as club funding grows.",
    points: [
      { lead: "Jerseys",
        text: "Official WHS Ping Pong jerseys are in the works and will be available to buy once they are ready." },
      { lead: "More on the way",
        text: "Funds grow through the year, so expect more gear as we go." },
      { lead: "For committed members",
        text: "Club gear is for people who show up. If you are not coming regularly, you will not get to use it." }
    ]
  },
  {
    icon:  "&#127955;",
    title: "Wednesday meetings",
    intro: "Our regular club day, open to anyone at Woodinville. No sign up, no tryout.",
    points: [
      { lead: "First to 5 rotation",
        text: "Every table, every meeting." },
      { lead: "Maximum 3 stays",
        text: "Win and you stay on, up to 3 wins. On the 4th you rotate out so everyone gets table time." },
      { lead: "Open play",
        text: "Unless a tournament or event is running, which takes the first quarter of the meeting." }
    ]
  }
];
