/* Connected investigation dialogue; evidence stays in pm25.js. */
(function(){
const narrative={
  "acts": [
    {
      "id": 1,
      "title": "A question the street cannot answer",
      "scenes": [
        "street"
      ]
    },
    {
      "id": 2,
      "title": "Find the people, then follow them",
      "scenes": [
        "cohort"
      ]
    },
    {
      "id": 3,
      "title": "Connect the records to the air",
      "scenes": [
        "exposure"
      ]
    },
    {
      "id": 4,
      "title": "Find the signal, then take the average apart",
      "scenes": [
        "results",
        "pattern",
        "inequity"
      ]
    },
    {
      "id": 5,
      "title": "Challenge the case",
      "scenes": [
        "checks",
        "limits"
      ]
    },
    {
      "id": 6,
      "title": "Return with a better question",
      "scenes": [
        "return"
      ]
    }
  ],
  "scenes": [
    {
      "id": "street",
      "act": 1,
      "question": "What would it take to study something this street cannot show us?",
      "conclusion": "Looking at a street cannot answer a question about years of exposure.",
      "exitLabel": "Follow the guide to the archive",
      "beats": [
        {
          "id": "street-1",
          "speaker": "GUIDE",
          "text": "Windows lit, the clinic still open. You could stand here all night and not learn what years of fine-particle air mean for anyone's mental health.",
          "exhibit": false
        },
        {
          "id": "street-2",
          "speaker": "YOU",
          "text": "So watching will not settle it. What would?",
          "exhibit": false
        },
        {
          "id": "street-3",
          "speaker": "GUIDE",
          "text": "People, places and time, tied together. The archive has all three. Come on, we connect them first and look for answers after.",
          "exhibit": false
        }
      ],
      "background": "../assets/images/stories/pm25/street-v2.webp",
      "position": "50% 50%"
    },
    {
      "id": "cohort",
      "act": 2,
      "question": "What does a newly recorded diagnosis tell us?",
      "conclusion": "The study follows new diagnosis records in two cohorts that may overlap.",
      "exitLabel": "Find the air around those addresses",
      "beats": [
        {
          "id": "cohort-1",
          "speaker": "GUIDE",
          "text": "Two files. One for anxiety, one for depression. Each starts with people who had no recorded diagnosis of that outcome, then follows their health records forward. Some people are in both files.",
          "exhibit": true
        },
        {
          "id": "cohort-2",
          "speaker": "YOU",
          "text": "So the outcome is a new line in someone's record. Before we tie that to the air, show me how to read it.",
          "exhibit": false,
          "choices": [
            {
              "id": "inspect-diagnosis",
              "label": "Open the diagnosis labels",
              "response": "The anxiety file casts a wide net. Stress-related disorders and several others sit under the same heading. Depression has its own codes. Either way, you are reading what a clinician wrote down, which is a different thing from how everyone felt.",
              "exhibit": true,
              "artifact": {
                "type": "findings",
                "eyebrow": "OPEN FILE / DIAGNOSIS LABELS",
                "heading": "What enters\na health record?",
                "rows": [
                  {
                    "label": "ANXIETY FAMILY",
                    "text": "Includes anxiety, obsessive-compulsive, stress-related, dissociative and somatoform disorders."
                  },
                  {
                    "label": "DEPRESSION",
                    "text": "Diagnostic codes F32–F33."
                  },
                  {
                    "label": "WHAT IS MISSED",
                    "text": "Symptoms that never become a recorded diagnosis."
                  }
                ],
                "foot": "Methods §2.3 · Outcomes depend on care and recording."
              }
            },
            {
              "id": "inspect-followup",
              "label": "Follow the calendar",
              "response": "The study runs from 2018 to 2022. Anyone with a diagnosis of the same outcome before baseline is set aside, and the rest are followed forward. That puts the records in order. It still cannot tell us when the symptoms began.",
              "exhibit": true,
              "artifact": {
                "type": "steps",
                "eyebrow": "OPEN FILE / THE CALENDAR",
                "heading": "Follow the records\nthrough time.",
                "steps": [
                  {
                    "title": "At baseline",
                    "text": "Exclude prior recorded diagnosis of the respective outcome."
                  },
                  {
                    "title": "May 2018–December 2022",
                    "text": "Observe later electronic health records in the study period."
                  },
                  {
                    "title": "A new recorded diagnosis",
                    "text": "The first observed entry is not necessarily the first symptom."
                  }
                ],
                "foot": "Methods §§2.1–2.3 · No exact symptom-onset date."
              }
            }
          ]
        }
      ],
      "background": "../assets/images/stories/pm25/archive-v2.webp",
      "position": "50% 50%"
    },
    {
      "id": "exposure",
      "act": 3,
      "question": "How does a person's address become an exposure estimate?",
      "conclusion": "Each person's exposure is an area's annual average, assigned by address. Nobody's actual breath was measured.",
      "exitLabel": "Compare the exposure groups",
      "beats": [
        {
          "id": "exposure-1",
          "speaker": "YOU",
          "text": "Fine, the records give us a timeline. Where does the air come in?",
          "exhibit": false
        },
        {
          "id": "exposure-2",
          "speaker": "GUIDE",
          "text": "Through the address at baseline. There is a fine pollution grid for the whole country. Average it over a three-digit ZIP area for one year, and that number goes to everyone in the study who lives there.",
          "exhibit": true,
          "choices": [
            {
              "id": "zoom-home",
              "label": "Zoom in on a home",
              "response": "The picture zooms. The data do not. Nothing here knows the air indoors, the daily route, or whether anyone moved later. However fine the grid, each person gets the area's number.",
              "exhibit": true,
              "artifact": {
                "type": "findings",
                "eyebrow": "ZOOM / THE DATA STOP HERE",
                "heading": "The home is visible.\nPersonal dose is not.",
                "rows": [
                  {
                    "label": "AVAILABLE",
                    "text": "A baseline three-digit ZIP and annual outdoor concentration."
                  },
                  {
                    "label": "UNAVAILABLE",
                    "text": "Indoor air, daily travel and later residential moves."
                  }
                ],
                "foot": "Conceptual city illustration · not a measured street map."
              }
            },
            {
              "id": "rebuild-map",
              "label": "Rebuild the ZIP estimate",
              "response": "The supplement rebuilds the area number four different ways and checks them against each other in 200 ZIP areas. They agree closely, so the averaging method holds up. What a person actually breathed is still nowhere in the data.",
              "exhibit": true,
              "artifact": {
                "type": "metrics",
                "eyebrow": "SUPPLEMENT / TABLE S2",
                "heading": "Rebuild the\narea estimate.",
                "rows": [
                  {
                    "label": "Aggregation approaches",
                    "value": "4",
                    "detail": "Simple, area, population and combined weights"
                  },
                  {
                    "label": "Sampled ZIP areas",
                    "value": "200",
                    "detail": "Correlations with combined weights ≥0.971"
                  }
                ],
                "foot": "Agreement in aggregation does not validate personal dose."
              }
            }
          ]
        },
        {
          "id": "exposure-3",
          "speaker": "GUIDE",
          "text": "Now the two sit side by side. An area's air for the year, and a timeline of diagnoses. Time to ask whether the timeline looks different where the air is worse.",
          "exhibit": false
        }
      ],
      "background": "../assets/images/stories/pm25/map-v2.webp",
      "position": "50% 50%"
    },
    {
      "id": "results",
      "act": 4,
      "question": "Does the association survive once measured differences are accounted for?",
      "conclusion": "The highest-exposure group has a higher adjusted hazard for both outcomes.",
      "exitLabel": "Look between the two endpoints",
      "beats": [
        {
          "id": "results-1",
          "speaker": "YOU",
          "text": "Hold on. The areas with worse air, and the people in them, could differ in other ways too.",
          "exhibit": false
        },
        {
          "id": "results-2",
          "speaker": "GUIDE",
          "text": "They could. So the model adjusts for the personal and community differences it can measure, then compares the quarter with the worst air against the quarter with the cleanest. After that, the hazard ratio is 1.10 for anxiety and 1.45 for depression.",
          "exhibit": true
        },
        {
          "id": "results-3",
          "speaker": "GUIDE",
          "text": "Read those as rates of new diagnoses across groups. They say nothing about any one person. And two endpoints can hide what happens in between.",
          "exhibit": true
        }
      ],
      "background": "../assets/images/stories/pm25/observatory.png",
      "position": "50% 50%"
    },
    {
      "id": "pattern",
      "act": 4,
      "question": "What did the high-versus-low comparison leave out?",
      "conclusion": "Anxiety and depression follow different exposure–response patterns.",
      "exitLabel": "Find whose experiences the average hides",
      "beats": [
        {
          "id": "pattern-1",
          "speaker": "YOU",
          "text": "Then open up the middle. What do the second and third quarters look like?",
          "exhibit": false
        },
        {
          "id": "pattern-2",
          "speaker": "GUIDE",
          "text": "Different for each outcome. Depression is already higher in the middle quarters. Anxiety only clearly rises in the top one. One headline number was covering two patterns, and it could be covering differences between people as well.",
          "exhibit": true
        }
      ],
      "background": "../assets/images/stories/pm25/observatory.png",
      "position": "50% 50%"
    },
    {
      "id": "inequity",
      "act": 4,
      "question": "Does the overall association hold the same way across different social conditions?",
      "conclusion": "The average hides differences between groups. Those differences are exploratory, and their causes were not tested.",
      "exitLabel": "Take the finding to the test bench",
      "beats": [
        {
          "id": "inequity-1",
          "speaker": "YOU",
          "text": "Who disappears when you average everyone together?",
          "exhibit": false
        },
        {
          "id": "inequity-2",
          "speaker": "GUIDE",
          "text": "Start with this. The high-versus-low association was stronger among Black participants. Before you read anything into that, pick which part of it to take apart.",
          "exhibit": true,
          "choices": [
            {
              "id": "unpack-race",
              "label": "Unpack the racial-group comparison",
              "response": "Each of those estimates compares worse air with cleaner air inside one group. Nobody here compared Black participants' risk with White participants'. The authors suggest social and structural reasons for the difference. The paper does not test them.",
              "exhibit": true,
              "artifact": {
                "type": "findings",
                "eyebrow": "UNPACK / THE COMPARISON",
                "heading": "Within each group,\ncompare exposure.",
                "rows": [
                  {
                    "label": "THE CONTRAST",
                    "text": "Higher versus lower pollution within a subgroup."
                  },
                  {
                    "label": "THE INTERACTION",
                    "text": "Race/ethnicity interaction p < 0.001 for both outcomes."
                  },
                  {
                    "label": "THE EXPLANATION",
                    "text": "Social and structural pathways are hypotheses, not tested mechanisms."
                  }
                ],
                "foot": "Results §3.2 · Exact disputed subgroup figures omitted."
              }
            },
            {
              "id": "inspect-conditions",
              "label": "Inspect insurance and deprivation",
              "response": "For anxiety, the association also shifted with insurance and with how deprived the community was. For depression the study does not show the same thing. And one subgroup having a bigger number is not, by itself, evidence of a difference between groups.",
              "exhibit": true,
              "artifact": {
                "type": "findings",
                "eyebrow": "UNPACK / SOCIAL CONDITIONS",
                "heading": "Which differences\nare supported?",
                "rows": [
                  {
                    "label": "ANXIETY × INSURANCE",
                    "text": "Interaction p = 0.006."
                  },
                  {
                    "label": "ANXIETY × DEPRIVATION",
                    "text": "Interaction p < 0.001."
                  },
                  {
                    "label": "DEPRESSION",
                    "text": "No supporting interaction p-value reported for these two modifiers."
                  }
                ],
                "foot": "Exploratory comparisons · no multiplicity correction."
              }
            }
          ]
        },
        {
          "id": "inequity-3",
          "speaker": "GUIDE",
          "text": "So the average was never the whole story. These are exploratory results, and the explanations stay open. Next question is whether the signal survives when we change the analysis.",
          "exhibit": false
        }
      ],
      "background": "../assets/images/stories/pm25/street-v2.webp",
      "position": "50% 50%"
    },
    {
      "id": "checks",
      "act": 5,
      "question": "Could another pollutant, or the assumption that nobody moved, explain the signal?",
      "conclusion": "The selected sensitivity checks keep the associations positive. They do not settle every bias.",
      "exitLabel": "Inspect what the tests could not reach",
      "beats": [
        {
          "id": "checks-1",
          "speaker": "YOU",
          "text": "Before we take this back to the street, I want to try to break it. Which alternative do we test first?",
          "exhibit": false,
          "choices": [
            {
              "id": "test-ozone",
              "label": "Account for ozone as well",
              "response": "Put annual ozone into the model and the high-versus-low PM₂.₅ associations stay positive for both outcomes. That accounts for one other pollutant. It does not make PM₂.₅ the cause.",
              "exhibit": true,
              "artifact": {
                "type": "findings",
                "eyebrow": "TEST / ANNUAL OZONE ADJUSTMENT",
                "heading": "Does the PM₂.₅\nassociation remain?",
                "rows": [
                  {
                    "label": "ANXIETY",
                    "text": "HR 1.13 · 95% CI 1.05–1.22"
                  },
                  {
                    "label": "DEPRESSION",
                    "text": "HR 1.45 · 95% CI 1.34–1.58"
                  }
                ],
                "foot": "Table S8 · Q4 vs Q1 · adjusted for ozone, not all pollutants."
              }
            },
            {
              "id": "test-residency",
              "label": "Focus on longer-term residents",
              "response": "Keep only the people who had lived at their baseline address for more than five years. Under the supplement's alternative annual exposure measure, the associations stay positive. Where those people went afterwards, nobody knows.",
              "exhibit": true,
              "artifact": {
                "type": "cohorts",
                "eyebrow": "TEST / MORE THAN FIVE YEARS",
                "heading": "A more stable\nbaseline residence.",
                "rows": [
                  {
                    "label": "Anxiety analysis",
                    "value": "35,850",
                    "detail": "Positive high-versus-low exposure association"
                  },
                  {
                    "label": "Depression analysis",
                    "value": "41,098",
                    "detail": "Positive high-versus-low exposure association"
                  }
                ],
                "foot": "Table S7 · alternative annual exposure · later moves unknown."
              }
            }
          ]
        },
        {
          "id": "checks-2",
          "speaker": "GUIDE",
          "text": "It survived that one. Worth something. But a sensitivity check can only test what the data let it test. What did this study never get to see?",
          "exhibit": false
        }
      ],
      "background": "../assets/images/stories/pm25/archive-v2.webp",
      "position": "50% 50%"
    },
    {
      "id": "limits",
      "act": 5,
      "question": "What missing evidence could still change how we read this?",
      "conclusion": "The evidence supports an association. What cleaner air would do was not tested.",
      "exitLabel": "Return to the street with the evidence",
      "beats": [
        {
          "id": "limits-1",
          "speaker": "YOU",
          "text": "Then what is missing is part of the case too. What could still change our reading?",
          "exhibit": false
        },
        {
          "id": "limits-2",
          "speaker": "GUIDE",
          "text": "People who moved and could not be followed. Illness that never reached a record. Smoking, physical activity, diet, what people did for work, none of it in the model. Each gap leaves room for another explanation.",
          "exhibit": true
        },
        {
          "id": "limits-3",
          "speaker": "YOU",
          "text": "So the records show an association and leave the explanation open. They cannot tell us how many diagnoses cleaner air would prevent.",
          "exhibit": false
        }
      ],
      "background": "../assets/images/stories/pm25/map-v2.webp",
      "position": "50% 50%"
    },
    {
      "id": "return",
      "act": 6,
      "question": "What can we honestly carry back to the city?",
      "conclusion": "Mental health and unequal conditions belong in air-quality research and discussion.",
      "exitLabel": "Read the research brief",
      "beats": [
        {
          "id": "return-1",
          "speaker": "GUIDE",
          "text": "Same corner. Two things to carry back. Mental health belongs in any conversation about air quality, and an average can hide unequal experiences. This paper gives a reason to look at both.",
          "exhibit": false
        },
        {
          "id": "return-2",
          "speaker": "YOU",
          "text": "I came here wanting a verdict on this street. I am leaving with a better question. If the air were cleaner, would mental health improve, and for whom? That takes another study.",
          "exhibit": false
        }
      ],
      "background": "../assets/images/stories/pm25/street-v2.webp",
      "position": "50% 50%"
    }
  ]
};
const data=window.RESEARCH_STORY;
if(!data)return;
data.acts=narrative.acts;
narrative.scenes.forEach(n=>Object.assign(data.scenes.find(s=>s.id===n.id),n));
})();
