import './styles/main.css';
import './datalist-polyfill.min';
import 'bootstrap/js/dist/modal';
import 'bootstrap/js/dist/dropdown';
import 'bootstrap/js/dist/collapse';
import 'bootstrap/js/dist/alert';
import Picker from 'vanilla-picker';
import { createTimetable } from './timetable';
import { fetchCourseCodes, getSelectedValue, alertCheck, displayElement, hexToRgbA } from './utils';

document.addEventListener(
  'DOMContentLoaded',
  () => {
    const $timetableWindow = document.getElementById('timetable-window');
    const $selectWindow = document.getElementById('select-window');
    const $courseInput = document.getElementById('courses');
    const $searchBtn = document.getElementById('searchBtn');
    const $toggleBtn = document.getElementById('toggleBtn');
    const $timetable = document.getElementById('timetable');
    const $footer = document.getElementById('footer');
    const $colleges = document.getElementById('colleges');
    const $colorPicker = document.getElementById('colorPicker');
    const $collegeSelect = document.getElementById('colleges');
    // const $colorPickerBg = document.getElementById('colorPickerBg');
    const parent = document.getElementById('parent');
    const picker = new Picker({
      parent,
      popup: 'left',
      alpha: false,
      color: localStorage.getItem('customAccentColor') || localStorage.getItem('accentColor')
    });

    const searchParams = new URLSearchParams(window.location.search);

    let collegeIndex = $colleges.options[$colleges.selectedIndex].value;

    document.documentElement.style.setProperty('--accent', localStorage.getItem('accentColor'));
    document.documentElement.style.setProperty(
      '--accent-rgba',
      localStorage.getItem('accentColorRgba')
    );
    $colorPicker.selectedIndex = localStorage.getItem('colorPickerIndex');

    const customOption = document.getElementById('customOption');
    customOption.value = localStorage.getItem('customAccentColor') || '#eeeeee';

    if (!localStorage.getItem('visited')) {
      window.location.reload(true);
      localStorage.setItem('visited', 1);
    }

    picker.onChange = c => {
      document.documentElement.style.setProperty('--accent', c.hex);
      localStorage.setItem('accentColor', c.hex);

      const rgbaAccent = c.rgbaString.split('(')[1].split(')')[0];
      document.documentElement.style.setProperty('--accent-rgba', rgbaAccent);
      localStorage.setItem('accentColorRgba', rgbaAccent);
    };

    picker.onDone = c => {
      customOption.removeAttribute('hidden');
      customOption.value = c.hex.substring(0, c.hex.length - 2);
      $colorPicker.selectedIndex = $colorPicker.options.length - 1;
      localStorage.setItem('colorPickerIndex', $colorPicker.selectedIndex);
      localStorage.setItem('customAccentColor', c.hex.substring(0, c.hex.length - 2));

      if (c.hex.substring(0, c.hex.length - 2) === '#696969') {
        window.open('https://i.imgur.com/AnxcJSO.jpg');
      }
    };

    if (searchParams.has('code')) {
      displayElement($selectWindow, false);
      displayElement($footer, false);

      displayElement($timetableWindow, true);
      createTimetable(
        searchParams.get('code'),
        searchParams.get('college') || '0',
        searchParams.get('sem')
      );
    } else {
      displayElement($footer, true);
      fetchCourseCodes(collegeIndex, () => {
        displayElement($selectWindow, true);
      });
      alertCheck();
    }

    const searchButtonClick = semester => {
      $timetable.innerHTML = '';

      displayElement($selectWindow, false);
      displayElement($timetableWindow, true);
      displayElement($footer, false);
      collegeIndex = $collegeSelect.options[$collegeSelect.selectedIndex].value;
      const courseCode = getSelectedValue();
      window.history.pushState(
        '',
        document.title,
        `?code=${courseCode}&college=${collegeIndex}${semester ? `&sem=${semester}` : ''}`
      );

      createTimetable(courseCode, collegeIndex, semester || '');
    };

    const BackButtonClick = () => {
      document.title = `MyTerm`;
      displayElement($timetableWindow, false);
      displayElement($selectWindow, true);
      displayElement($footer, true);
      fetchCourseCodes(collegeIndex);

      document.getElementById('course-title').innerHTML = '';

      alertCheck();

      window.history.pushState('', document.title, `${window.location.pathname}`);
    };

    $colleges.addEventListener('change', () => {
      $courseInput.value = '';
      const index = $colleges.options[$colleges.selectedIndex].value;
      fetchCourseCodes(index);
    });

    $colorPicker.addEventListener('change', e => {
      const selectedColor = e.target.value;
      // Set CSS variable, set local storage hex and selected index
      document.documentElement.style.setProperty('--accent', selectedColor);
      localStorage.setItem('accentColor', selectedColor);
      localStorage.setItem('colorPickerIndex', $colorPicker.selectedIndex);

      // Get RGBA of selected hex, set CSS variable and store in local storage
      const rgbaAccent = hexToRgbA(selectedColor);
      document.documentElement.style.setProperty('--accent-rgba', rgbaAccent);
      localStorage.setItem('accentColorRgba', rgbaAccent);

      // Set pickers color for next open
      picker.setColor(selectedColor);
    });

    // $colorPickerBg.addEventListener('change', e => {
    //   document.documentElement.style.setProperty('--dark-background-color', e.target.value);
    //   localStorage.setItem('bgColor', e.target.value);
    //   localStorage.setItem('colorPickerBgIndex', $colorPicker.selectedIndex);
    // });

    window.onpopstate = () => {
      // window.location.reload();
      BackButtonClick();
    };

    $courseInput.addEventListener('change', e => {
      if ($courseInput.value.trim().length < 1) {
        $searchBtn.disabled = true;
        $toggleBtn.disabled = true;
      } else {
        $searchBtn.disabled = false;
        $toggleBtn.disabled = false;
      }
    });

    document.addEventListener('keyup', e => {
      if (e.keyCode === 8 && $timetableWindow.style.display === 'block') {
        BackButtonClick();
      }
      if (e.keyCode === 13 && !$searchBtn.disabled && $timetableWindow.style.display === 'none') {
        searchButtonClick();
      }
    });

    document.getElementById('searchBtn').addEventListener(
      'click',
      e => {
        console.log(e.target);
        searchButtonClick();
      },
      false
    );

    document.getElementById('semOneBtn').addEventListener(
      'click',
      () => {
        searchButtonClick('0');
      },
      false
    );

    document.getElementById('semTwoBtn').addEventListener(
      'click',
      () => {
        searchButtonClick('1');
      },
      false
    );

    document.getElementById('backBtn').addEventListener('click', () => BackButtonClick(), false);
  },
  false
);
