/**
 * Starter text for the first ODIPA article, loaded from the "Start from the
 * voter privacy article" button in the Articles admin. It is only a starting
 * point for the editor. Nothing is published until an admin saves it, adds the
 * author, checks every claim against the sources, and clicks Publish.
 */
export const STARTER_ARTICLE = {
  title: 'Your Vote Is Private. Is Your Voter Data?',
  summary:
    'Your ballot is secret, but your voter registration details can legally reach political campaigns. Here is what they can see, what you cannot opt out of, and three ways to limit the rest.',
  author: 'Nicholas',
  sources: [
    'California Secretary of State, Voter Registration Information File Request | https://www.sos.ca.gov/elections/voter-registration/voter-registration-information-file-request',
    'California Secretary of State, Access to Voter Registration Information (regulations) | https://www.sos.ca.gov/administration/regulations/current-regulations/elections/access-voter-registration-information',
  ].join('\n'),
  body: `As each United States election approaches, millions of California residents make their plans to cast their ballots, whether in person or by mail. During this period you may also notice more political phone calls, text messages, emails, or campaign mail. This is no coincidence. Political campaigns commonly rely on voter information to identify potential supporters, communicate with voters, and encourage participation in an upcoming election.

Much of that outreach is informed by personal information that campaigns can legally obtain from voter registration records. When Californians register to vote, certain details they provide may become accessible to political organizations, allowing campaigns to better understand and target prospective voters. These records do not reveal how an individual voted, but they can give campaigns a lot of information about the people they are trying to reach.

This raises two questions: What information can political campaigns access about you, and how can you prevent your voter information from being shared?

## What do political campaigns know about you?

In California, when a resident registers to vote, they provide personal information such as their name, residential address, date of birth, and political party preference. This information is compiled into a voter registration record. These records are not generally available to the public. However, California law allows certain organizations and individuals, including political campaigns, to request access to this information for authorized purposes.

Campaigns may also request a voter's participation history. This identifies which previous elections a voter took part in and whether they voted by mail or in person. It is kept separately from the voter registration record and does not disclose which candidates or ballot measures a person voted for.

## Can you prevent your voter information from being shared?

California gives residents an opt-out for certain commercial uses of their personal information under the California Consumer Privacy Act (CCPA). No such option exists for registered voters to stop their information from being shared for legally authorized political purposes.

There are limited exceptions. California's Safe at Home program, for example, lets people who meet certain eligibility requirements, including survivors of domestic violence and stalking, register to vote confidentially. That protection is meant for people facing particular safety concerns. It does not cover voters who simply want more data privacy. As a result, most California registered voters have little control over whether their registration information is made available to authorized political organizations.

That does not mean voters have no control at all. Campaigns also collect information through political surveys, online petitions, donation forms, and other forms a prospective voter fills in. This extra information gives campaigns a more tailored picture of a voter's interests and preferences, and it is the part you decide to share or not share. Being mindful of what you volunteer helps limit unnecessary data collection.

## How can you protect your data privacy this election?

Although California voters cannot generally opt out of their authorized voter registration data being shared, there are steps you can take to limit the collection of additional personal information.

1. Use official election resources. When you check your voter registration status or look for election information, use official government websites, or websites with URLs ending in .gov. California's Secretary of State provides a My Voter Status portal where voters can review their registration information. If you miss the regular registration deadline, which traditionally falls 15 days before Election Day, you may still be able to conditionally register and vote through Election Day at your county elections office or an authorized in-person voting location.
2. Be mindful of what information you share. Before answering a political survey, signing an online petition, or subscribing to campaign messages, think about what is being asked and whether it is necessary. Sharing extra contact details such as a personal email address, phone number, or political candidate preference gives organizations more than they may already have from voter registration records.
3. Be cautious of unsolicited political communications. As Election Day approaches, voters may receive more political emails, calls, and texts. Many are legitimate. Avoid clicking unfamiliar links or giving sensitive information in response to unsolicited messages, especially ones that claim you must act immediately to keep your voter eligibility.

## Your vote matters. So does your privacy.

California law protects the secrecy of what is in your ballot. That protection does not extend to every piece of information tied to your voter registration or political activity. Voters have limited control over what the law allows to be disclosed, but knowing what campaigns can access matters. It is just as important to be selective about the extra details you share with campaigns through surveys, petitions, and forms.

For more on voter registration and voter privacy protections, see the California Secretary of State's [Elections and Voter Information](https://www.sos.ca.gov/elections) pages.`,
}
