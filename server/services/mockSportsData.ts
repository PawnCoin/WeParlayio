// This file provides mock data for additional sports
export const additionalSportsData = {
  // College Sports
  football_ncaaf: [
    {
      id: "ncaaf_1",
      sport_key: "football_ncaaf",
      sport_title: "NCAA Football",
      commence_time: new Date(Date.now() + 86400000 * 5).toISOString(),
      home_team: "Georgia Bulldogs",
      away_team: "Alabama Crimson Tide",
      bookmakers: [
        {
          key: "draftkings",
          title: "DraftKings",
          last_update: new Date().toISOString(),
          markets: [
            {
              key: "h2h",
              outcomes: [
                { name: "Georgia Bulldogs", price: -145 },
                { name: "Alabama Crimson Tide", price: 125 }
              ]
            }
          ]
        }
      ]
    },
    {
      id: "ncaaf_2",
      sport_key: "football_ncaaf",
      sport_title: "NCAA Football",
      commence_time: new Date(Date.now() + 86400000 * 6).toISOString(),
      home_team: "Ohio State Buckeyes",
      away_team: "Michigan Wolverines",
      bookmakers: [
        {
          key: "draftkings",
          title: "DraftKings",
          last_update: new Date().toISOString(),
          markets: [
            {
              key: "h2h",
              outcomes: [
                { name: "Ohio State Buckeyes", price: -130 },
                { name: "Michigan Wolverines", price: 110 }
              ]
            }
          ]
        }
      ]
    }
  ],
  
  basketball_ncaam: [
    {
      id: "ncaam_1",
      sport_key: "basketball_ncaam",
      sport_title: "NCAA Men's Basketball",
      commence_time: new Date(Date.now() + 86400000 * 2).toISOString(),
      home_team: "Gonzaga Bulldogs",
      away_team: "Duke Blue Devils",
      bookmakers: [
        {
          key: "draftkings",
          title: "DraftKings",
          last_update: new Date().toISOString(),
          markets: [
            {
              key: "h2h",
              outcomes: [
                { name: "Gonzaga Bulldogs", price: -115 },
                { name: "Duke Blue Devils", price: -105 }
              ]
            }
          ]
        }
      ]
    },
    {
      id: "ncaam_2",
      sport_key: "basketball_ncaam",
      sport_title: "NCAA Men's Basketball",
      commence_time: new Date(Date.now() + 86400000 * 4).toISOString(),
      home_team: "Kentucky Wildcats",
      away_team: "Kansas Jayhawks",
      bookmakers: [
        {
          key: "draftkings",
          title: "DraftKings",
          last_update: new Date().toISOString(),
          markets: [
            {
              key: "h2h",
              outcomes: [
                { name: "Kentucky Wildcats", price: 105 },
                { name: "Kansas Jayhawks", price: -125 }
              ]
            }
          ]
        }
      ]
    }
  ],
  
  basketball_ncaaw: [
    {
      id: "ncaaw_1",
      sport_key: "basketball_ncaaw",
      sport_title: "NCAA Women's Basketball",
      commence_time: new Date(Date.now() + 86400000 * 3).toISOString(),
      home_team: "South Carolina Gamecocks",
      away_team: "UConn Huskies",
      bookmakers: [
        {
          key: "draftkings",
          title: "DraftKings",
          last_update: new Date().toISOString(),
          markets: [
            {
              key: "h2h",
              outcomes: [
                { name: "South Carolina Gamecocks", price: -140 },
                { name: "UConn Huskies", price: 120 }
              ]
            }
          ]
        }
      ]
    },
    {
      id: "ncaaw_2",
      sport_key: "basketball_ncaaw",
      sport_title: "NCAA Women's Basketball",
      commence_time: new Date(Date.now() + 86400000 * 5).toISOString(),
      home_team: "Iowa Hawkeyes",
      away_team: "LSU Tigers",
      bookmakers: [
        {
          key: "draftkings",
          title: "DraftKings",
          last_update: new Date().toISOString(),
          markets: [
            {
              key: "h2h",
              outcomes: [
                { name: "Iowa Hawkeyes", price: -110 },
                { name: "LSU Tigers", price: -110 }
              ]
            }
          ]
        }
      ]
    }
  ],
  
  // Professional Leagues
  basketball_wnba: [
    {
      id: "wnba_1",
      sport_key: "basketball_wnba",
      sport_title: "WNBA",
      commence_time: new Date(Date.now() + 86400000 * 2).toISOString(),
      home_team: "Las Vegas Aces",
      away_team: "New York Liberty",
      bookmakers: [
        {
          key: "draftkings",
          title: "DraftKings",
          last_update: new Date().toISOString(),
          markets: [
            {
              key: "h2h",
              outcomes: [
                { name: "Las Vegas Aces", price: -125 },
                { name: "New York Liberty", price: 105 }
              ]
            }
          ]
        }
      ]
    },
    {
      id: "wnba_2",
      sport_key: "basketball_wnba",
      sport_title: "WNBA",
      commence_time: new Date(Date.now() + 86400000 * 4).toISOString(),
      home_team: "Minnesota Lynx",
      away_team: "Phoenix Mercury",
      bookmakers: [
        {
          key: "draftkings",
          title: "DraftKings",
          last_update: new Date().toISOString(),
          markets: [
            {
              key: "h2h",
              outcomes: [
                { name: "Minnesota Lynx", price: -115 },
                { name: "Phoenix Mercury", price: -105 }
              ]
            }
          ]
        }
      ]
    }
  ],
  
  football_ufl: [
    {
      id: "ufl_1",
      sport_key: "football_ufl",
      sport_title: "UFL",
      commence_time: new Date(Date.now() + 86400000 * 3).toISOString(),
      home_team: "Birmingham Stallions",
      away_team: "Michigan Panthers",
      bookmakers: [
        {
          key: "draftkings",
          title: "DraftKings",
          last_update: new Date().toISOString(),
          markets: [
            {
              key: "h2h",
              outcomes: [
                { name: "Birmingham Stallions", price: -135 },
                { name: "Michigan Panthers", price: 115 }
              ]
            }
          ]
        }
      ]
    },
    {
      id: "ufl_2",
      sport_key: "football_ufl",
      sport_title: "UFL",
      commence_time: new Date(Date.now() + 86400000 * 4).toISOString(),
      home_team: "St. Louis Battlehawks",
      away_team: "D.C. Defenders",
      bookmakers: [
        {
          key: "draftkings",
          title: "DraftKings",
          last_update: new Date().toISOString(),
          markets: [
            {
              key: "h2h",
              outcomes: [
                { name: "St. Louis Battlehawks", price: -120 },
                { name: "D.C. Defenders", price: 100 }
              ]
            }
          ]
        }
      ]
    }
  ],
  boxing_main: [
    {
      id: "boxing_1",
      sport_key: "boxing_main",
      sport_title: "Boxing",
      commence_time: new Date(Date.now() + 86400000 * 3).toISOString(), // 3 days from now
      home_team: "Tyson Fury",
      away_team: "Anthony Joshua",
      bookmakers: [
        {
          key: "draftkings",
          title: "DraftKings",
          last_update: new Date().toISOString(),
          markets: [
            {
              key: "h2h",
              outcomes: [
                { name: "Tyson Fury", price: -150 },
                { name: "Anthony Joshua", price: 130 }
              ]
            }
          ]
        }
      ]
    },
    {
      id: "boxing_2",
      sport_key: "boxing_main",
      sport_title: "Boxing",
      commence_time: new Date(Date.now() + 86400000 * 5).toISOString(), // 5 days from now
      home_team: "Canelo Alvarez",
      away_team: "Gennady Golovkin",
      bookmakers: [
        {
          key: "draftkings",
          title: "DraftKings",
          last_update: new Date().toISOString(),
          markets: [
            {
              key: "h2h",
              outcomes: [
                { name: "Canelo Alvarez", price: -120 },
                { name: "Gennady Golovkin", price: 100 }
              ]
            }
          ]
        }
      ]
    }
  ],
  
  mma_ufc: [
    {
      id: "ufc_1",
      sport_key: "mma_ufc",
      sport_title: "UFC",
      commence_time: new Date(Date.now() + 86400000 * 2).toISOString(), // 2 days from now
      home_team: "Jon Jones",
      away_team: "Francis Ngannou",
      bookmakers: [
        {
          key: "draftkings",
          title: "DraftKings",
          last_update: new Date().toISOString(),
          markets: [
            {
              key: "h2h",
              outcomes: [
                { name: "Jon Jones", price: -110 },
                { name: "Francis Ngannou", price: -110 }
              ]
            }
          ]
        }
      ]
    },
    {
      id: "ufc_2",
      sport_key: "mma_ufc",
      sport_title: "UFC",
      commence_time: new Date(Date.now() + 86400000 * 7).toISOString(), // 7 days from now
      home_team: "Israel Adesanya",
      away_team: "Alex Pereira",
      bookmakers: [
        {
          key: "draftkings",
          title: "DraftKings",
          last_update: new Date().toISOString(),
          markets: [
            {
              key: "h2h",
              outcomes: [
                { name: "Israel Adesanya", price: -130 },
                { name: "Alex Pereira", price: 110 }
              ]
            }
          ]
        }
      ]
    }
  ],
  
  motorsport_nascar: [
    {
      id: "nascar_1",
      sport_key: "motorsport_nascar",
      sport_title: "NASCAR",
      commence_time: new Date(Date.now() + 86400000 * 4).toISOString(), // 4 days from now
      home_team: "Kyle Larson",
      away_team: "Field",
      bookmakers: [
        {
          key: "draftkings",
          title: "DraftKings",
          last_update: new Date().toISOString(),
          markets: [
            {
              key: "h2h",
              outcomes: [
                { name: "Kyle Larson", price: 550 },
                { name: "Denny Hamlin", price: 600 },
                { name: "Chase Elliott", price: 650 },
                { name: "Kyle Busch", price: 750 }
              ]
            }
          ]
        }
      ]
    },
    {
      id: "nascar_2",
      sport_key: "motorsport_nascar",
      sport_title: "NASCAR",
      commence_time: new Date(Date.now() + 86400000 * 11).toISOString(), // 11 days from now
      home_team: "Daytona 500",
      away_team: "Field",
      bookmakers: [
        {
          key: "draftkings",
          title: "DraftKings",
          last_update: new Date().toISOString(),
          markets: [
            {
              key: "h2h",
              outcomes: [
                { name: "Chase Elliott", price: 500 },
                { name: "Denny Hamlin", price: 550 },
                { name: "Kyle Larson", price: 600 },
                { name: "Joey Logano", price: 700 }
              ]
            }
          ]
        }
      ]
    }
  ],
  
  tennis_atp: [
    {
      id: "tennis_atp_1",
      sport_key: "tennis_atp",
      sport_title: "Tennis (ATP)",
      commence_time: new Date(Date.now() + 86400000 * 1).toISOString(), // 1 day from now
      home_team: "Novak Djokovic",
      away_team: "Rafael Nadal",
      bookmakers: [
        {
          key: "draftkings",
          title: "DraftKings",
          last_update: new Date().toISOString(),
          markets: [
            {
              key: "h2h",
              outcomes: [
                { name: "Novak Djokovic", price: -140 },
                { name: "Rafael Nadal", price: 120 }
              ]
            }
          ]
        }
      ]
    },
    {
      id: "tennis_atp_2",
      sport_key: "tennis_atp",
      sport_title: "Tennis (ATP)",
      commence_time: new Date(Date.now() + 86400000 * 2.5).toISOString(), // 2.5 days from now
      home_team: "Carlos Alcaraz",
      away_team: "Alexander Zverev",
      bookmakers: [
        {
          key: "draftkings",
          title: "DraftKings",
          last_update: new Date().toISOString(),
          markets: [
            {
              key: "h2h",
              outcomes: [
                { name: "Carlos Alcaraz", price: -160 },
                { name: "Alexander Zverev", price: 140 }
              ]
            }
          ]
        }
      ]
    }
  ],
  
  tennis_wta: [
    {
      id: "tennis_wta_1",
      sport_key: "tennis_wta",
      sport_title: "Tennis (WTA)",
      commence_time: new Date(Date.now() + 86400000 * 1.5).toISOString(), // 1.5 days from now
      home_team: "Iga Swiatek",
      away_team: "Aryna Sabalenka",
      bookmakers: [
        {
          key: "draftkings",
          title: "DraftKings",
          last_update: new Date().toISOString(),
          markets: [
            {
              key: "h2h",
              outcomes: [
                { name: "Iga Swiatek", price: -130 },
                { name: "Aryna Sabalenka", price: 110 }
              ]
            }
          ]
        }
      ]
    },
    {
      id: "tennis_wta_2",
      sport_key: "tennis_wta",
      sport_title: "Tennis (WTA)",
      commence_time: new Date(Date.now() + 86400000 * 3.5).toISOString(), // 3.5 days from now
      home_team: "Coco Gauff",
      away_team: "Naomi Osaka",
      bookmakers: [
        {
          key: "draftkings",
          title: "DraftKings",
          last_update: new Date().toISOString(),
          markets: [
            {
              key: "h2h",
              outcomes: [
                { name: "Coco Gauff", price: -110 },
                { name: "Naomi Osaka", price: -110 }
              ]
            }
          ]
        }
      ]
    }
  ]
};