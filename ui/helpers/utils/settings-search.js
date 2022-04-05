/* eslint-disable require-unicode-regexp */
import { SETTINGS_ROUTES } from '../constants/settings';

let settingsRoutes;

export function getSettingsRoutes() {
  if (settingsRoutes) {
    return settingsRoutes;
  }
  settingsRoutes = SETTINGS_ROUTES.filter((s) => {
    if (s.featureFlag) {
      return process.env[s.featureFlag];
    }
    return true;
  });
  return settingsRoutes;
}

function getFilteredSettingsRoutes(tabName) {
  return getSettingsRoutes().filter((s) => s.tab === tabName);
}

export function getNumberOfSettingsInSection(tabName) {
  return getSettingsRoutes().filter((s) => s.tab === tabName).length;
}

export function handleSettingsRefs(tabName, settingsRefs) {
  const settingsSearchJsonFiltered = getFilteredSettingsRoutes(tabName);
  const settingsRefsIndex = settingsSearchJsonFiltered.findIndex(
    (s) => s.route.substring(1) === window.location.hash.substring(1),
  );
  if (settingsRefsIndex === -1) {
    return;
  }
  const settingsRef =
    settingsSearchJsonFiltered.length === 1
      ? settingsRefs
      : settingsRefs[settingsRefsIndex];
  if (settingsRef !== null) {
    settingsRef?.current.scrollIntoView({
      behavior: 'smooth',
    });
    settingsRef?.current.focus();
    const historySettingsUrl = window.location.hash.split('#')[1];
    window.location.hash = historySettingsUrl;
  }
}

function colorText(menuElement, regex) {
  if (menuElement !== null) {
    let elemText = menuElement.innerHTML;
    elemText = elemText.replace('&amp;', '&');
    elemText = elemText.replace(
      /(<span style="background:#ffd33d">|<\/span>)/gim,
      '',
    );
    menuElement.innerHTML = elemText.replace(
      regex,
      '<span style="background:#ffd33d">$&</span>',
    );
  }
}

export function highlightSearchedText() {
  const searchElem = document.getElementById('search-settings');
  const searchRegex = new RegExp(searchElem.value, 'gi');
  const results = document.querySelectorAll(
    '.settings-page__header__search__list__item',
  );

  [...results].forEach((element) => {
    const menuTabElement = element.querySelector(
      '.settings-page__header__search__list__item__tab',
    );
    const menuSectionElement = element.querySelector(
      '.settings-page__header__search__list__item__section',
    );

    colorText(menuTabElement, searchRegex);
    colorText(menuSectionElement, searchRegex);
  });
}
