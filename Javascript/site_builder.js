/**
 * @file
 * A series of functions designed for building the Barbermonger Jcink forum. These functions exist to build new HTML templates from existing content for pages not currently covered by the existing Jcink HTML Template system.
 * @author      LunaMora
 * @version     1.0.0
 * @date        2025-##-##
 * @license     GNU AGPLv3
 */

/**
 * When called, grabs the mod team list from the existing forum structure and create an object of mod data to use to build the new mod team page.
 * @returns {Array<Object>} An array of mod objects with the following properties:
 *   - avatarIMGLink {string} - URL to the moderator's avatar image
 *   - userID {string} - The numeric ID of the moderator
 *   - userName {string} - The display name of the moderator
 *   - modsForumName {string} - The name of the forum this person moderates
 */
const parseModTeamList = () => {
  const table = document.querySelector('#moderating-team table');

  // get all rows except the two two header rows
  const rows = Array.from(table.querySelectorAll(':scope > tbody > tr')).slice(2);

  const modTeam = [];

  rows.forEach((row) => {
    const cells = Array.from(row.querySelectorAll('td'));

    // skip the sub heading cells
    if (cells.length > 1) {
      // grab PFP
      const avatarIMGLink = cells[1].querySelector('img').src;

      // grab username and ID
      const userLink = cells[2].querySelector('a');
      const userID = userLink.getAttribute('href').match(/showuser=(\d+)/)[1];
      const userName = userLink.innerText.trim();

      // grab mod area
      const modsForumName = cells[4].innerText.trim();

      // create object and add to array
      modTeam.push({
        avatarIMGLink,
        userID,
        userName,
        modsForumName,
      });
    }
  });

  return modTeam;
};

/**
 * Creates a new mod card based on the provided moderator data.
 *
 * @param {Object} mod - The moderator object.
 * @param {string} mod.avatarIMGLink - The URL to the moderator's avatar image.
 * @param {string} mod.userID - The unique identifier for the moderator.
 * @param {string} mod.userName - The moderator's username.
 * @returns {HTMLElement} The HTML element representing the mod card.
 */
const buildModTeamList = (mod) => {
  const { avatarIMGLink, userID, userName } = mod;

  const modCard = document.createElement('div');
  modCard.classList.add('mod-card');

  const modInfo = `<a href="?showuser=${userID}" title="click to view profile"> <h2 class="title">Mod</h2> <div class="user-name">${userName.toLowerCase()}</div> <img src="${avatarIMGLink}" alt="Avatar" class="avatar" /> <div class="user-info">Click to View Profile</div> </a>`;

  modCard.innerHTML = modInfo;

  return modCard;
};

/**
 * When called, grabs the active topics list from the existing forum structure and create an object of active topic data to use to build the new Active Topics page.
 *
 * @function parseActiveTopics
 * @returns {Array<Object>} An array of active topic objects
 */
const parseActiveTopics = () => {
  // Get the active topics table
  const table = document.querySelector('#active-topics .tablebasic');

  // Get all rows except the header row
  const rows = Array.from(table.querySelectorAll(':scope > tbody > tr')).slice(1);

  const activeTopics = [];

  // Process each topic row
  rows.forEach((row) => {
    const cells = Array.from(row.querySelectorAll('td'));

    // grab read macro
    const read = cells[0].innerHTML.trim();

    // grab topic name and ID
    const topicLink = cells[4].querySelector('a');
    const topicID = topicLink.getAttribute('href').match(/showtopic=(\d+)/)[1];
    const topicName = topicLink.innerText.trim();

    // grab description
    const desc = cells[2].querySelector('span.desc')?.textContent || '';

    // grab forum name and ID
    const forumLink = cells[5].querySelector('a');
    const forumID = forumLink.getAttribute('href').match(/showforum=(\d+)/)[1];
    const forumName = forumLink.innerText.trim();

    // grab starter name and ID
    const starterLink = cells[6].querySelector('a');
    let starterID, starterName;
    if (starterLink) {
      starterID = starterLink.getAttribute('href').match(/showuser=(\d+)/)[1];
      starterName = starterLink.innerText.trim();
    } else {
      starterID = 'none';
      starterName = cells[6].textContent.trim();
    }

    // Parse replies and views
    const replies = cells[7]?.textContent.trim() || '0';
    const views = cells[8]?.textContent.trim() || '0';

    // grab last action date and user
    const lastAction = cells[9].innerHTML.trim();
    const lastPostDate = lastAction.match(/(.*?)<br>/)[1].trim();
    const lastPosterLink = cells[9].querySelectorAll('a')[1];
    let lastPosterID, lastPosterName;
    if (lastPosterLink) {
      lastPosterID = lastPosterLink.getAttribute('href').match(/showuser=(\d+)/)[1];
      lastPosterName = lastPosterLink.innerText.trim();
    } else {
      lastPosterID = 'none';
      lastPosterName = cells[9].querySelector('b').textContent.trim();
    }

    // Create and add the topic object to the array
    activeTopics.push({
      read,
      topicID,
      topicName,
      desc,
      forumID,
      forumName,
      starterID,
      starterName,
      replies,
      views,
      lastPostDate,
      lastPosterID,
      lastPosterName,
    });
  });

  return activeTopics;
};

/**
 * Creates a DOM element representing an active topic row based on the provided topic data.
 *
 * @param {Object} topic - The topic data object.
 * @param {string} topic.read - The read status HTML for the topic.
 * @param {string|number} topic.topicID - The unique identifier for the topic.
 * @param {string} topic.topicName - The title of the topic.
 * @param {string} topic.desc - The description or excerpt of the topic.
 * @param {string|number} topic.forumID - The unique identifier for the forum containing this topic.
 * @param {string} topic.forumName - The name of the forum containing this topic.
 * @param {string} topic.starterID - The unique identifier of the user who started the topic, or 'none' if a guest.
 * @param {string} topic.starterName - The username of the person who started the topic.
 * @param {number|string} topic.replies - The number of replies to the topic.
 * @param {number|string} topic.views - The number of views the topic has received.
 * @param {string} topic.lastPostDate - The formatted date of the last post.
 * @param {string} topic.lastPosterID - The unique identifier of the user who made the last post, or 'none' if a guest.
 * @param {string} topic.lastPosterName - The username of the person who made the last post.
 *
 * @returns {HTMLDivElement} A div element containing the formatted topic row with thread tags and HTML comment markers.
 */
const buildActiveTopicRow = (topic) => {
  const { read, topicID, topicName, desc, forumID, forumName, starterID, starterName, replies, views, lastPostDate, lastPosterID, lastPosterName } =
    topic;

  let newActiveTopicsRow = `<grid><macro>${read}</macro><name><a href="?showtopic=${topicID}" title="${topicName}">${topicName}</a></name><stats><span class="replies">${replies}</span> replies & <span class="views">${views}</span> views </stats><desc>${desc}</desc>`;

  // handle if starter is a guest
  if (starterID === 'none') {
    newActiveTopicsRow += `<firstposter>started by: <span>${starterName}</span></firstposter>`;
  } else {
    newActiveTopicsRow += `<firstposter>started by: <a href="?showuser=${starterID}">${starterName}</a></firstposter>`;
  }

  // Add forum info
  newActiveTopicsRow += `<forum-posted>in forum: <a href="?showforum=${forumID}">${forumName}</a></forum-posted>`;

  // handle if last poster is a guest
  if (lastPosterID === 'none') {
    newActiveTopicsRow += `<lastposter><a href="?showtopic=${topicID}&view=getlastpost" title="Go to Latest Reply">latest reply</a>: <span>${lastPosterName}</span></lastposter>`;
  } else {
    newActiveTopicsRow += `<lastposter> <a href="?showtopic=${topicID}&view=getlastpost" title="Go to Latest Reply">latest reply</a>: <a href="?showuser=${lastPosterID}">${lastPosterName}</a> </lastposter>`;
  }

  // add last post date and close the grid
  newActiveTopicsRow += `<last-post>${lastPostDate}</last-post> </grid>`;

  const newRow = document.createElement('div');
  newRow.id = `t-${topicID}`;
  newRow.className = 'active-topic-row';
  newRow.innerHTML = newActiveTopicsRow;

  const threadTags = document.createElement('div');
  threadTags.id = `t-${topicID} thread-tags`;

  newRow.prepend(threadTags);

  return newRow;
};
