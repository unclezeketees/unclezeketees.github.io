# ASVAB Test Structure and Content (CAT-ASVAB and Paper-and-Pencil), as of 2025-2026

Method note: All officialasvab.com pages were downloaded as raw HTML on 2026-11-09 and the `<table>` rows parsed directly (the "What to Expect" table renders garbled in text scrapers; the raw rows are unambiguous). The ASVAB Fact Sheet PDF (file dated October 2026 at `wp-content/uploads/2026/10/ASVAB-Fact_Sheet.pdf`) was downloaded and text-extracted. The ASVAB CEP (school program) Counselor Manual (PDF created 2025-10-16) and CEP Overview booklet (PDF created 2026-02-10) were downloaded from prod-media.asvabprogram.com. mepcom.army.mil returned HTTP 403 and www.todaysmilitary.com did not resolve from this environment, so neither was used. Page "last modified" stamps embedded in the officialasvab.com HTML are quoted where useful to show currency.

## Key Question 1: CAT-ASVAB subtest counts (scored and tryout) and time limits

### Takeaway
The proctored CAT-ASVAB has 10 subtests totaling 135 scored questions and 197 minutes of subtest time without tryout items; each subtest can carry up to 15 additional unscored tryout questions (with a longer time limit), but tryouts appear in only 2 to 4 subtests per examinee. The three official sources (What to Expect page, applicants CAT-ASVAB page, and Fact Sheet PDF) agree exactly on every per-subtest number.

### Cited Findings
- Official per-subtest table (identical rows on two officialasvab.com pages; the "What to Expect" page carries a last-modified stamp of 2026-10-23 in its HTML). Columns: scored questions / possible tryout questions / time limit without tryouts (min) / time limit with tryouts (min):
  - General Science (GS): 15 / 15 / 12 / 25
  - Arithmetic Reasoning (AR): 15 / 15 / 55 / 113
  - Word Knowledge (WK): 15 / 15 / 9 / 18
  - Paragraph Comprehension (PC): 10 / 15 / 27 / 75
  - Mathematics Knowledge (MK): 15 / 15 / 31 / 65
  - Electronics Information (EI): 15 / 15 / 10 / 21
  - Auto Information (AI): 10 / 15 / 7 / 18
  - Shop Information (SI): 10 / 15 / 6 / 17
  - Mechanical Comprehension (MC): 15 / 15 / 22 / 42
  - Assembling Objects (AO): 15 / 15 / 18 / 38
  — [What to Expect When You Take the ASVAB](https://www.officialasvab.com/applicants/what-to-expect/); same table at [The CAT-ASVAB (applicants)](https://www.officialasvab.com/applicants/cat-asvab/)
- Fact Sheet PDF "ASVAB Test Lengths and Time Limits" (CAT-ASVAB, no-tryout figures): GS 15 Q / 12 min; AR 15 / 55; WK 15 / 9; PC 10 / 27; MK 15 / 31; EI 15 / 10; AI 10 / 7; SI 10 / 6; MC 15 / 22; AO 15 / 18; **Total 135 questions / 197 minutes**. — [ASVAB Fact Sheet PDF (Oct 2026 upload)](https://www.officialasvab.com/wp-content/uploads/2026/10/ASVAB-Fact_Sheet.pdf), linked from [ASVAB Fact Sheet page (modified 2026-10-06)](https://www.officialasvab.com/applicants/fact-sheet/)
- "The number of questions and time limits for the subtests on the proctored CAT-ASVAB vary depending upon whether 'tryout' questions are administered. Tryout questions are new questions that do not count toward your score. Each examinee receives tryout questions in 2 to 4 of the ASVAB subtests, with tryout questions randomly dispersed throughout each of the selected subtests. Extra time is given to complete a subtest when tryout questions are administered." — [What to Expect](https://www.officialasvab.com/applicants/what-to-expect/)
- Subtests are administered in the order listed in the table (GS, AR, WK, PC, MK, EI, AI, SI, MC, AO): "The subtests are presented in the order in which they are administered." — [What to Expect](https://www.officialasvab.com/applicants/what-to-expect/); [ASVAB Subtests (counselors)](https://www.officialasvab.com/counselors-educators/subtests/)
- AI and SI are separate subtests on the CAT-ASVAB but are "combined into one single score (labeled AS)"; the AS score is reported for both CAT and P&P administrations. — [What to Expect](https://www.officialasvab.com/applicants/what-to-expect/); [Fact Sheet PDF](https://www.officialasvab.com/wp-content/uploads/2026/10/ASVAB-Fact_Sheet.pdf)
- The recruiters' CAT-ASVAB page (HTML stamp 2023-01-20) describes the adaptive mechanics and rules but, as currently published, contains no per-subtest count/time table; the applicant pages and Fact Sheet are the sources for those numbers. — [The CAT-ASVAB (recruiters)](https://www.officialasvab.com/recruiters/cat-asvab/)
- The school-based ASVAB Career Exploration Program (CEP) uses a different computer version ("iCAT") with different lengths: GS 16, AR 16, WK 16, PC 11, MK 16, EI 16, Auto 11, Shop 11, MC 16 items; it does not include Assembling Objects. These are NOT the enlistment CAT-ASVAB numbers and should not be used for a MEPS practice test. — [ASVAB CEP Counselor Manual, Table 1-1 (PDF created Oct 2025)](https://prod-media.asvabprogram.com/CEP_PDF_Contents/ASVAB_CEP_Counselor_Manual.pdf); [ASVAB CEP Overview (PDF created Feb 2026)](https://prod-media.asvabprogram.com/CEP_PDF_Contents/ASVAB_CEP_Overview.pdf)

### Inferences
- Arithmetic check: 15+15+15+10+15+15+10+10+15+15 = 135 scored items and 12+55+9+27+31+10+7+6+22+18 = 197 minutes, matching the Fact Sheet totals, so the parsed table rows are internally consistent.
- Theoretical maximum if every subtest had tryouts would be 285 items / 432 minutes, but because only 2-4 subtests get tryouts, a realistic session is 135 scored + 30-60 tryout items. A practice test that wants to simulate tryouts should add 15 unscored items to 2-4 randomly chosen subtests and apply the "with tryout" time limit to those subtests only.
- Per-item pacing without tryouts ranges from about 36 seconds per item (WK, SI) to about 3.7 minutes per item (AR), so AR and PC are deliberately generous while WK/EI/AI/SI are brisk.

### Gaps
- No official source states how many tryout items appear within a given subtest when selected (the table gives only the maximum "possible" of 15); whether a selected subtest always gets exactly 15 is not stated.
- No official 2025-2026 Technical Bulletin describing the current CAT-ASVAB item pools was found on officialasvab.com; the References page lists Technical Bulletins Nos. 1-4 (2006-2012) only and says "Information Papers—Coming Soon!" — [References & Documentation (modified 2026-10-06)](https://www.officialasvab.com/counselors-educators/references-documentation/)

## Key Question 2: Paper-and-pencil ASVAB — questions and time per subtest, and total

### Takeaway
The enlistment P&P-ASVAB has 9 subtests (AI and SI are merged into AS), 225 questions, and 149 minutes of test time; the whole session including administration runs about 3 to 4 hours.

### Cited Findings
- P&P-ASVAB table: GS 25 questions / 11 minutes; AR 30 / 36; WK 35 / 11; PC 15 / 13; MK 25 / 24; EI 20 / 9; Auto & Shop Information (AS) 25 / 11; MC 25 / 19; AO 25 / 15; **Total 225 / 149**. — [What to Expect](https://www.officialasvab.com/applicants/what-to-expect/); identical in [Fact Sheet PDF](https://www.officialasvab.com/wp-content/uploads/2026/10/ASVAB-Fact_Sheet.pdf)
- "AI and SI are combined into one single subtest (AS) in the paper-and-pencil administration." — [What to Expect](https://www.officialasvab.com/applicants/what-to-expect/)
- "Each subtest has a fixed number of questions and time limit." "The total time required, including administrative tasks and instructions, is 3 to 4 hours." — [What to Expect](https://www.officialasvab.com/applicants/what-to-expect/)
- Fact Sheet: "In all, it takes about 3 hours to complete the P&P-ASVAB." — [Fact Sheet PDF](https://www.officialasvab.com/wp-content/uploads/2026/10/ASVAB-Fact_Sheet.pdf)
- "The paper-and-pencil version is given at only a handful of MET sites." and "The ASVAB is administered by computer at the MEPS and at most MET sites." — [What to Expect (modified 2026-10-23)](https://www.officialasvab.com/applicants/what-to-expect/). The Fact Sheet PDF instead says the ASVAB "is administered by computer at all MEPS, and by paper and pencil (P&P) at most MET sites" and that "Roughly 70% of military applicants take the test via computer" — [Fact Sheet PDF](https://www.officialasvab.com/wp-content/uploads/2026/10/ASVAB-Fact_Sheet.pdf). These statements conflict; the What to Expect page is the more recently edited text (see Inferences).
- P&P answer sheets are sent to the MEPS to be scanned and scored, "usually takes a few days." — [What to Expect](https://www.officialasvab.com/applicants/what-to-expect/)
- Scores on CAT and P&P are equated so "a Word Knowledge score of 55 on CAT-ASVAB means exactly the same as a Word Knowledge score of 55 on the P&P-ASVAB." — [The CAT-ASVAB (recruiters)](https://www.officialasvab.com/recruiters/cat-asvab/)
- The school (CEP) P&P version differs from the enlistment P&P: 8 subtests (no AO), 200 items, 134 minutes of test time plus 36 minutes of administration. Flag: this is the CEP form, not the MEPS form. — [ASVAB CEP Counselor Manual](https://prod-media.asvabprogram.com/CEP_PDF_Contents/ASVAB_CEP_Counselor_Manual.pdf)

### Inferences
- Arithmetic check: 25+30+35+15+25+20+25+25+25 = 225 and 11+36+11+13+24+9+11+19+15 = 149, confirming the parsed rows.
- The Fact Sheet PDF's metadata shows an original creation date of 2010 with a modification date of October 2026, so some narrative sentences (e.g., "70% take the test via computer," "P&P at most MET sites") are likely legacy text that was not refreshed, while the tables were. Treat the What to Expect page's description of where P&P is given as current.

### Gaps
- No official source gives a per-subtest breakdown of the 25 AS items into auto vs. shop content on the enlistment P&P form (the CEP iCAT splits 11/11 but that is a different program).

## Key Question 3: Test rules — calculator, returning to earlier questions, unanswered items/penalties, session time, PiCAT

### Takeaway
No calculator is permitted on any version; on the CAT-ASVAB you cannot go back or change an answer once you move on, and unfinished items are scored as if answered at random (a real penalty, so keep answering legitimately rather than clicking randomly), whereas on P&P you may review within a subtest and should guess on everything because there is no guessing penalty. The proctored CAT-ASVAB averages about 2 hours (Fact Sheet says about 1.5 hours); the PiCAT is an untimed, unproctored, at-home CAT-ASVAB that must be verified at a MEPS/MET site within 45 days.

### Cited Findings
Calculator
- "You cannot use a calculator when taking the ASVAB." — [What to Expect](https://www.officialasvab.com/applicants/what-to-expect/)
- Rationale FAQ: the ASVAB is "an employment test" assessing whether you can apply principles on the job; "Knowledge of basic math and the ability to do hand calculations (without a calculator) may be required on the job." — [FAQs (modified 2026-10-23)](https://www.officialasvab.com/applicants/faqs/); also [Myths About the ASVAB (modified 2025-02-14)](https://www.officialasvab.com/recruiters/myths/)
- Scratch paper and pencil are available: the HELP key may be pressed for "needing more scratch paper or another pencil," and PiCAT guidance says to "Have access to scratch paper and a pencil/pen." — [The CAT-ASVAB (recruiters)](https://www.officialasvab.com/recruiters/cat-asvab/); [PiCAT (recruiters)](https://www.officialasvab.com/recruiters/picat/)

Navigation / changing answers (CAT-ASVAB)
- "Because CAT-ASVAB is adaptive, applicants cannot change the answer to a question once they have gone on to the next question." — [The CAT-ASVAB (recruiters)](https://www.officialasvab.com/recruiters/cat-asvab/)
- "You are not able to review or change your answers once you have submitted an answer on the CAT-ASVAB." — [Fact Sheet PDF](https://www.officialasvab.com/wp-content/uploads/2026/10/ASVAB-Fact_Sheet.pdf)
- "Be sure the answer you have selected is the one you want to select, as you aren't allowed to return to a question once you have answered it." — [Preparing for the ASVAB](https://www.officialasvab.com/applicants/prepare/)

Unanswered items / guessing penalty
- CAT: "A penalty procedure is applied to all examinees who do not complete the test before time runs out. This is done by scoring the items that were not completed as though they were answered at random. In almost all cases it is not necessary to apply the penalty, as the time constraints are liberal enough that nearly all examinees are able to complete each subtest." — [The CAT-ASVAB (applicants)](https://www.officialasvab.com/applicants/cat-asvab/)
- CAT: "If time is running short, try to read and legitimately answer the questions, rather than filling in random guesses for the remaining items, as the CAT-ASVAB applies a relatively large penalty when several incorrect answers are provided toward the end of a subtest." — [Preparing for the ASVAB](https://www.officialasvab.com/applicants/prepare/)
- CAT: "If you are running out of time, it is best to continue trying to answer as best as you can rather than filling in random guesses for the remaining items, as the CAT-ASVAB has a penalty for guessing." — [Fact Sheet PDF](https://www.officialasvab.com/wp-content/uploads/2026/10/ASVAB-Fact_Sheet.pdf)
- P&P: "Answer every question. If you run out of time, it is to your advantage to fill in random guesses for the remaining items, as there is no penalty for guessing." Also: "Don't get hung up trying to answer questions you don't know — answer the questions you do know and return later to the ones you skipped." "Review your answers if there is time remaining." "Make sure that you select only one response per item on your answer sheet, and erase completely if you change your answer." — [Preparing for the ASVAB](https://www.officialasvab.com/applicants/prepare/)
- P&P: "Once you complete the questions in a subtest, you will be able to review your answers. However, you will not be able to go back to an earlier subtest or proceed to the next subtest until instructed." — [What to Expect](https://www.officialasvab.com/applicants/what-to-expect/)
- General strategy for both: "When you don't know the answer to a question, try to rule out as many incorrect choices as you can, and then make an educated guess from the remaining answers." — [Preparing for the ASVAB](https://www.officialasvab.com/applicants/prepare/)

Pacing, timing display, and session length
- CAT is self-paced: "when you complete a subtest, you can immediately move on to the next subtest without waiting for everyone else"; "almost all examinees complete the individual subtests before the time expires"; "the amount of time and number of questions remaining for that subtest are displayed in the lower right-hand corner"; "On average, it takes about 2 hours to complete the proctored CAT-ASVAB"; scores "available immediately following your testing session." — [What to Expect](https://www.officialasvab.com/applicants/what-to-expect/)
- Fact Sheet: "The average examinee takes about 1 ½ hours to complete the CAT-ASVAB" and "On average, the CAT-ASVAB takes about half the time of the P&P-ASVAB." — [Fact Sheet PDF](https://www.officialasvab.com/wp-content/uploads/2026/10/ASVAB-Fact_Sheet.pdf). This conflicts with the "about 2 hours" on the What to Expect page.
- "If an applicant finishes a subtest before the time limit is reached, he/she automatically goes on to the next test." Time spent on the red HELP key or reading instructions "does not count against the subtest time limit." On computer failure the applicant restarts "at the beginning of the subtest he/she was working on" and "Subtest timing also starts over." — [The CAT-ASVAB (recruiters)](https://www.officialasvab.com/recruiters/cat-asvab/)
- Input: "Applicants have a choice of using either the keyboard or mouse for entering their responses"; the keyboard is modified so only needed keys are labeled; a tutorial precedes the first subtest. — [The CAT-ASVAB (recruiters)](https://www.officialasvab.com/recruiters/cat-asvab/)
- Adaptive mechanics: "All examinees start with a question of medium difficulty. If the examinee answers the question correctly he/she is given a question that is more difficult. If the examinee answers the question incorrectly, he/she is given a question that is easier." — [The CAT-ASVAB (recruiters)](https://www.officialasvab.com/recruiters/cat-asvab/)
- Security: "ASVAB test questions are treated as controlled testing materials... Applicants who either give or receive information about test questions are subject to severe penalties." Recruiter "is not permitted in the testing room." Late arrivals are turned away. — [What to Expect](https://www.officialasvab.com/applicants/what-to-expect/)
- Retest policy: wait 1 calendar month after the initial test, another calendar month for a second retest, then 6 calendar months thereafter; scores valid for enlistment for 2 years. — [FAQs](https://www.officialasvab.com/applicants/faqs/)

PiCAT basics
- PiCAT = "Pending Internet Computerized Adaptive Test"; an unproctored CAT-ASVAB that "doesn't need to be taken at a MEPS or MET site, there are no time limits for the individual subtests, and no tryout items are administered." — [What to Expect](https://www.officialasvab.com/applicants/what-to-expect/)
- Access code from a recruiter, expires 30 days after issue; once started, must be completed within 48 hours; expect 2 to 3 hours; can be taken only once and only by those who have never taken the ASVAB; supported browsers Edge, Chrome, Safari, Firefox, Samsung Internet; screen at least 7 inches diagonal (tablets OK). — [PiCAT (recruiters, modified 2025-07-15)](https://www.officialasvab.com/recruiters/picat/); [What to Expect](https://www.officialasvab.com/applicants/what-to-expect/)
- Scores are not shown to the applicant; only the registering recruiter sees them. If eligible, the applicant takes a proctored Verification Test (Vtest) at a MEPS/MET site within 45 days of the PiCAT; Vtest takes 25-30 minutes, yields no score to the applicant, and if passed the PiCAT scores become the official scores of record. — [PiCAT (recruiters)](https://www.officialasvab.com/recruiters/picat/)
- PiCAT integrity guidance: take it "WITHOUT receiving ANY assistance, such as asking someone for help looking up or posting information on the internet or using a calculator." — [PiCAT (recruiters)](https://www.officialasvab.com/recruiters/picat/)
- School-tested applicants whose CEP ASVAB was given via School Staff Testing (SST) must also take a Vtest before scores can be used to enlist. — [What to Expect](https://www.officialasvab.com/applicants/what-to-expect/); [FAQs](https://www.officialasvab.com/applicants/faqs/)

### Inferences
- For a practice-test tool simulating CAT-ASVAB: lock answers on advance, show a per-subtest countdown and items-remaining counter in the lower right, auto-advance when a subtest's time expires, and (if simulating scoring) treat unanswered items as random responses rather than as blanks or as zero.
- The "about 2 hours" vs "about 1 ½ hours" discrepancy is likely the difference between a session with tryout items (current proctored practice) and legacy text from before tryouts were expanded; the What to Expect page is the more recently edited and should be preferred for the proctored MEPS experience.

### Gaps
- No official source specifies the exact scoring formula or the magnitude of the CAT-ASVAB end-of-subtest penalty, only that unfinished items are scored "as though they were answered at random" and the penalty is "relatively large" for strings of wrong answers near the end.
- mepcom.army.mil (HTTP 403 from this environment) and todaysmilitary.com (unreachable) could not be consulted for additional procedural rules (e.g., breaks between subtests, allowed personal items).

## Key Question 4: Content domains and item formats per subtest (with described official sample items)

### Takeaway
Every official sample item is a four-option multiple-choice question (A-D). Verbal and math subtests are text-only except for a few MK figures; GS/EI/AI/SI mix text items with occasional labeled diagrams; MC is heavily diagram-based (labeled physical scenes); AO uses a left reference box plus four candidate figures in two distinct formats (connection/"touch" items and jigsaw/"fit together" items).

### Cited Findings

Domain framework
- "The ASVAB subtests are designed to measure aptitudes in four domains: Verbal, Math, Science and Technical, and Spatial." Domain mapping: GS, EI, AI, SI, MC = Science/Technical; AR, MK = Math; WK, PC = Verbal; AO = Spatial. — [ASVAB Subtests (counselors, modified 2025-04-08)](https://www.officialasvab.com/counselors-educators/subtests/); [What to Expect](https://www.officialasvab.com/applicants/what-to-expect/)
- Official one-line descriptions: GS "Knowledge of physical and biological sciences"; AR "Ability to solve arithmetic word problems"; WK "Ability to select the correct meaning of words presented in context and to identify the best synonym for a given word"; PC "Ability to obtain information from written passages"; MK "Knowledge of high school mathematics principles"; EI "Knowledge of electricity and electronics"; AI "Knowledge of automobile technology"; SI "Knowledge of tools and shop terminology and practices"; MC "Knowledge of mechanical and physical principles"; AO "Ability to determine how an object will look when its parts are put together." — [ASVAB Subtests](https://www.officialasvab.com/counselors-educators/subtests/)
- AFQT is computed from AR, MK, PC, and WK; AFQT percentiles 1-99 against a 1997 norming sample of 18-23-year-olds; categories I (93-99), II (65-92), IIIA (50-64), IIIB (31-49), IVA (21-30), IVB (16-20), IVC (10-15), V (1-9). — [Understanding ASVAB Scores](https://www.officialasvab.com/applicants/scores/)
- Official stance on prep: no endorsed method beyond "a solid core of courses in mathematics, English, and science in high school and/or college"; "Taking technical courses will also help with performance on the Auto Information, Shop Information, Electronics Information, and Mechanical Comprehension subtests." — [Preparing for the ASVAB](https://www.officialasvab.com/applicants/prepare/)
- Sample questions hub lists all 10 subtests with "View Sample Questions" buttons linking to the per-subtest pages below. — [Sample Questions](https://www.officialasvab.com/applicants/sample-questions/)

General Science (GS)
- Detailed content (from the official CEP Overview, which is written for the same ASVAB content): "science topics drawn from courses taught in most high schools. The life science items cover botany, zoology, anatomy and physiology, and ecology. The earth and space science items are based on astronomy, geology, meteorology, and oceanography. The physical science items measure force and motion mechanics, energy, fluids, atomic structure, and chemistry." — [ASVAB CEP Overview](https://prod-media.asvabprogram.com/CEP_PDF_Contents/ASVAB_CEP_Overview.pdf)
- Official sample page: four text-only, four-option items. Described: (1) a physics/density item asking why air is less dense than water, with answer choices about molecular spacing and motion; (2) a unit-conversion item asking the Fahrenheit equivalent of a Celsius boiling-point temperature; (3) a chemistry item asking why salt melts ice, with the correct idea being freezing-point depression; (4) an earth-science recall item asking which gas is most abundant in Earth's atmosphere. All are single-sentence stems with short answer options; difficulty is introductory high-school level. — [General Science sample questions](https://www.officialasvab.com/general-science-gs/)

Arithmetic Reasoning (AR)
- Detailed content: "basic arithmetic problems encountered in everyday life. One-step and multi-step word problems require addition, subtraction, multiplication, and division, and choosing the correct order of operations when more than one step is necessary. The items include operations with whole numbers, operations with rational numbers, ratio and proportion, interest and percentage, and measurement." — [ASVAB CEP Overview](https://prod-media.asvabprogram.com/CEP_PDF_Contents/ASVAB_CEP_Overview.pdf)
- Official sample page: four text-only word problems with four numeric options. Described: (1) a rate problem — given rotations per minute of a tire, find rotations in a half hour (multiplication with a unit conversion of time); (2) a fraction-of-a-population problem — one in nine people vote one way, find how many of a town of several hundred vote the other way (fraction of a whole plus subtraction); (3) a percent-depreciation problem — a vehicle's price after one year of a fixed percentage loss; (4) a proportional-rate problem — gallons from a faucet in a different number of seconds given a known rate. Distractors include intermediate results (e.g., the number of votes for the minority party, the depreciation amount itself). — [Arithmetic Reasoning sample questions](https://www.officialasvab.com/arithmetic-reasoning-ar/)

Word Knowledge (WK)
- Detailed content: "the ability to understand the meaning of words through synonyms... The test is a measure of one component of reading comprehension since vocabulary is one of many factors that characterize reading comprehension." — [ASVAB CEP Overview](https://prod-media.asvabprogram.com/CEP_PDF_Contents/ASVAB_CEP_Overview.pdf)
- Two item formats appear on the official sample page: (a) the bare-word format "[Word] most nearly means" followed by four one-word options (three of the four samples use this, with target words at roughly a high-school vocabulary level — a verb meaning to provoke, an adjective describing a drooping plant, and a verb meaning to tremble); (b) the in-context format, where a short sentence contains the target word (on the live test the word is marked/underlined) and the examinee chooses the option closest in meaning (the sample uses a noun meaning anxiety or dread). — [Word Knowledge sample questions](https://www.officialasvab.com/word-knowledge-wk/); format also described as "words presented in context and... best synonym for a given word" in [ASVAB Subtests](https://www.officialasvab.com/counselors-educators/subtests/)

Paragraph Comprehension (PC)
- Detailed content: "Students read different types of passages of varying lengths and respond to questions based on information presented in each passage. Concepts include identifying stated and reworded facts, determining a sequence of events, drawing conclusions, identifying main ideas, determining the author's purpose and tone, and identifying style and technique." — [ASVAB CEP Overview](https://prod-media.asvabprogram.com/CEP_PDF_Contents/ASVAB_CEP_Overview.pdf)
- Official sample page: four items, each a short passage (2-5 sentences) followed by one question with four options. Described: (1) a two-sentence descriptive passage about a region's landscape, with an inference question ("the author implies...") about which terrain type it does NOT resemble; (2) a three-sentence expository passage about a metal's oxide layer and artists, with a literal-detail question ("according to the passage..."); (3) a literary/narrative passage describing a beach and approaching storm clouds, with a question asking what a quoted word ("deception") refers to — an interpretation item; (4) a longer (five-sentence) expository passage about window orientation and solar heating, with a main-purpose/detail question. Item types thus span stated fact, inference, and interpretation of a word in context. — [Paragraph Comprehension sample questions](https://www.officialasvab.com/paragraph-comprehension-pc/)

Mathematics Knowledge (MK)
- Official description: "Knowledge of high school mathematics principles." — [ASVAB Subtests](https://www.officialasvab.com/counselors-educators/subtests/). Detailed content: "concepts and algorithms and involve number theory, numeration, algebraic operations and equations, geometry and measurement, and probability." — [ASVAB CEP Overview](https://prod-media.asvabprogram.com/CEP_PDF_Contents/ASVAB_CEP_Overview.pdf)
- Official sample page: four items, two with images. Described: (1) a radical-simplification item presented as a small image of a square root of a fraction, with options including an irrational and several integers; (2) a geometry item showing a labeled 3-D rectangular prism (edges labeled 8, 3, 4) and asking for its volume; (3) an algebra item asking to simplify a difference-of-squares expression divided by a binomial (given a non-zero condition), with options that are linear binomials; (4) a ratio-reduction item asking which simple ratio equals a given two-digit ratio. Mix of algebra, geometry, and number sense; no calculator. — [Mathematics Knowledge sample questions](https://www.officialasvab.com/mathematics-knowledge-mk/)

Electronics Information (EI)
- Detailed content: "understanding of electrical current, circuits, devices, and systems. Electronics information topics include electrical tools, symbols, devices, and materials; electrical circuits; electrical and electronic systems; and electrical currents." — [ASVAB CEP Overview](https://prod-media.asvabprogram.com/CEP_PDF_Contents/ASVAB_CEP_Overview.pdf)
- Official sample page: four items, one with a circuit diagram. Described: (1) a schematic showing a battery (labeled 6 volts) in a single loop with two resistors labeled 2 ohms and 4 ohms (standard zigzag resistor symbols, battery as long/short parallel lines), asking the current through one resistor — requires Ohm's law on a series circuit; options are fractions of an amp and small whole amps; (2) a conceptual item about solid-state diodes having no filament and its implication for operating power; (3) a recall item asking what quantity an ohmmeter measures; (4) a terminology item asking what the abbreviation "AC" stands for. — [Electronics Information sample questions](https://www.officialasvab.com/electronics-information-ei/)

Auto Information (AI)
- Detailed content (Auto and Shop combined description): "aptitude for automotive maintenance and repair and wood and metal shop practices. The test covers several areas commonly included in most high school auto and shop courses such as automotive components, automotive systems, automotive tools, troubleshooting and repair, shop tools, building materials, and building and construction procedures." — [ASVAB CEP Overview](https://prod-media.asvabprogram.com/CEP_PDF_Contents/ASVAB_CEP_Overview.pdf)
- Official sample page: four items, one with a diagram. Described: (1) a suspension item asking what shock absorbers connect the axle to; (2) a cutaway cross-section drawing of a single engine cylinder with numbered callouts 1-6 (spark plug at top, intake/exhaust passages, piston, connecting rod, cylinder wall, combustion chamber) asking which numbered location is where combustion occurs — a "identify the numbered part" format; (3) a troubleshooting item about spark-plug heat range when a car is driven mostly in the city (carbon fouling); (4) a systems item asking which vehicle system the radiator belongs to. — [Auto Information sample questions](https://www.officialasvab.com/auto-information-ai/)

Shop Information (SI)
- Official sample page: three items, one with a picture. Described: (1) a purpose item asking why sanding blocks are used; (2) a line drawing of a woodworking clamp with two tall jaws joined by two threaded rods with handles (a handscrew-type clamp) asking the examinee to name the clamp type from four clamp names — a "name the pictured tool" format; (3) a tool-selection item asking which handsaw is best for a rough cut with the grain in thick stock (ripsaw vs. backsaw, coping saw, crosscut saw). — [Shop Information sample questions](https://www.officialasvab.com/shop-information-si/)

Mechanical Comprehension (MC) — diagram formats in detail
- Detailed content: "understanding of the principles of mechanical devices, structural support, and properties of materials. Mechanical comprehension topics include simple machines, compound machines, mechanical motion, and fluid dynamics." — [ASVAB CEP Overview](https://prod-media.asvabprogram.com/CEP_PDF_Contents/ASVAB_CEP_Overview.pdf)
- Official sample page: five items, all diagram-based, four options each. Formats observed:
  1. Single-scene principle question: a black-and-white line drawing of a crawler crane with a long lattice boom lifting a load; stem asks what extending the crane's reach will shift (correct concept: center of gravity). Options are short noun phrases.
  2. Lettered-arrow direction question: a skier descending a slope with four labeled arrows (A-D) drawn around the skis pointing up-slope, down-slope, straight down, and perpendicular; stem asks which arrow shows the direction friction acts. Options are just the letters A-D.
  3. Labeled cross-section with pressure reasoning: a piston pump cutaway labeled "Outlet Valve Closed" (Z), "Intake Valve Open" (X), and an interior chamber (Y); stem asks why the intake valve opens when the piston moves down; options are comparative statements about air pressure at the labeled points.
  4. Compare-four-configurations question: four small side-by-side drawings labeled A-D, each showing a shelf bracket attached to a wall with a diagonal brace or chain in a different position; stem asks which shelf will support the most weight. Options are letters A-D.
  5. Identify-the-mechanism question: a drawing of a toothed gear wheel meshing with a screw-like shaft (worm gear); stem asks what type of gear arrangement is shown; options are gear-type names (spur, bevel, rack and pinion, worm and wheel).
  — [Mechanical Comprehension sample questions](https://www.officialasvab.com/mechanical-comprehension-mc/)
- Additional MC sample formats in the CEP Overview (same content domain): a load on a beam between two posts asking which post bears more of the load; a belt/pulley arrangement asking which pulley turns fastest; a gear-ratio example asking how many revolutions gear B makes if gear A makes a given number. — [ASVAB CEP Overview](https://prod-media.asvabprogram.com/CEP_PDF_Contents/ASVAB_CEP_Overview.pdf)

Assembling Objects (AO) — diagram formats in detail
- Official sample page: two items, each a single wide image (about 500x126 px) consisting of five boxes in a row: a leftmost reference box, then four answer boxes labeled A-D. Two distinct formats:
  1. Connection ("touch") format: the reference box shows two simple shapes (e.g., a half-circle and a triangle), each with a small lettered point (a, b) on it, plus a short line segment whose ends are labeled with the same letters. The four options show the two shapes joined by a line; the examinee picks the option where the line connects the shapes at the correctly lettered points with correct orientation/rotation. Stem wording: which figure best shows how the objects in the left box will touch if the letters for each object are matched.
  2. Jigsaw ("fit together") format: the reference box shows three or four irregular pieces (wedge- and crescent-shaped fragments of a circle); the four options each show a circle divided by internal lines into pieces; the examinee picks the option whose internal divisions correspond to the given pieces assembled (shapes may be rotated but not flipped/mirrored in the correct answer). Stem wording: which figure best shows how the objects in the left box will appear if they are fit together.
  — [Assembling Objects sample questions](https://www.officialasvab.com/assembling-objects-ao/)
- AO is given only in the Enlistment Testing Program, not the school (CEP/Student Testing) program. — [FAQs](https://www.officialasvab.com/applicants/faqs/); [ASVAB Subtests](https://www.officialasvab.com/counselors-educators/subtests/)

### Inferences
- All official samples use exactly four options; a realistic practice test should use four-option multiple choice throughout, with letter-only options (A-D) for diagram-pointing items in MC and AO.
- The CEP Overview's detailed content outlines are the most granular official topic lists available; the officialasvab.com pages give only one-line descriptions. Because officialasvab.com states that "The contents of the ASVAB are the same across the Student and Enlistment Testing Programs, except that the Assembling Objects test is given in the Enlistment Testing Program" ([FAQs](https://www.officialasvab.com/applicants/faqs/)), the CEP topic outlines can be applied to the enlistment CAT-ASVAB subtests.
- Item counts on the sample pages (3-5 per subtest) are illustrative only and do not reflect the proportion of diagram items on the real test; for MC, however, every official sample is diagram-based, suggesting diagrams are the norm for MC.

### Gaps
- No official source publishes the proportion of items per topic within a subtest (e.g., how many GS items are life vs. physical science) or the share of diagram-based items in EI/AI/SI/MC.
- The live CAT-ASVAB presentation of WK in-context items (whether the target word is underlined, bolded, or capitalized) is not described officially; the sample page simply shows the sentence.

## Key Question 5: Official statements of targeted reading level / math level

### Takeaway
Officially, MK is described as "high school mathematics principles," GS as topics "drawn from courses taught in most high schools," and AS as areas "commonly included in most high school auto and shop courses"; no official source found states a numeric reading grade level for the test.

### Cited Findings
- MK: "Knowledge of high school mathematics principles." — [ASVAB Subtests](https://www.officialasvab.com/counselors-educators/subtests/); [Sample Questions hub](https://www.officialasvab.com/applicants/sample-questions/) ("focused on high school mathematics")
- GS: "science topics drawn from courses taught in most high schools." — [ASVAB CEP Overview](https://prod-media.asvabprogram.com/CEP_PDF_Contents/ASVAB_CEP_Overview.pdf)
- AS: "several areas commonly included in most high school auto and shop courses." — [ASVAB CEP Overview](https://prod-media.asvabprogram.com/CEP_PDF_Contents/ASVAB_CEP_Overview.pdf)
- Preparation: recommended "a solid core of courses in mathematics, English, and science in high school and/or college." — [Preparing for the ASVAB](https://www.officialasvab.com/applicants/prepare/)
- The CEP is offered to students in grades 10, 11, and 12 and to post-secondary students, and CEP score reports use grade-specific norms (e.g., "10th Grade Standard Score Bands"). — [ASVAB CEP Counselor Manual](https://prod-media.asvabprogram.com/CEP_PDF_Contents/ASVAB_CEP_Counselor_Manual.pdf)
- Norm reference for enlistment scores: Standard Scores and AFQT percentiles are relative to "a national sample of youth aged 18 to 23" (1997 norming study). — [Understanding ASVAB Scores](https://www.officialasvab.com/applicants/scores/)

### Inferences
- The test is pitched at the level of a general high-school curriculum (grades 10-12), consistent with its administration to sophomores through seniors in the CEP and to 18-23-year-old norm groups; practice content should target standard high-school algebra/geometry, general science survey courses, and high-school-level vocabulary and reading passages.

### Gaps
- No official statement of a specific readability grade level (e.g., "10th-grade reading level") for PC passages or WK vocabulary was found on officialasvab.com, in the Fact Sheet, or in the CEP Counselor Manual/Overview. Third-party prep sites make such claims but are not official and were not relied on.
