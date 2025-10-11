import { Elements } from "@t4g/types";
import { Transition } from "@headlessui/react";
import React from "react";
import { useOnClickOutside } from "usehooks-ts";

export const SelectElement = ({
  inline,
  zIndex,
  listHeight,
  label,
  value,
  options = [],
  variant = "default",
  status = "default",
  handleChange,
}: Elements.SelectElement.Props): JSX.Element => {
  const [open, setOpen] = React.useState(false);
  const [_value, setValue] = React.useState(value || label);
  const [_status, setStatus] = React.useState(status);
  const ref = React.useRef(null);
  const onClickOutside = () => {
    setOpen(false);
  };
  useOnClickOutside(ref, onClickOutside);

  const variants = {
    default: {
      text: "text-base text-blue-005",
      chevron: "text-blue-008",
      border: "border-blue-003",
      list: "w-full mt-1",
      active: {
        text: "text-blue-002",
        chevron: "text-blue-002",
        border: "border-blue-002",
      },
    },
    theme: {
      text: "bg-white text-base text-blue-008 hover:font-medium",
      chevron: "text-blue-008",
      border: "border-blue-003",
      list: "w-full mt-1",
      active: {
        text: "bg-white text-base text-blue-005",
        chevron: "text-blue-008",
        border: "border-blue-003",
      },
    },
  };
  let _variant: Elements.SelectElement.Variant;
  if (typeof variant === "object") {
    _variant = variant;
  } else {
    _variant = variants[variant];
  }

  return (
    <div
      ref={ref}
      className={`SelectElement relative inline-block text-left ${
        zIndex ? "" : "z-10"
      } ${inline ? "" : "w-full"}`}
      style={{ zIndex: zIndex ? zIndex : 10 }}
    >
      <div className="w-full">
        <button
          type="button"
          className={`form-select text-left ${
            _status === "active" ? _variant.active.border : _variant.border
          } px-4 py-1  focus:outline-none focus:ring-0 focus:ring-offset-1 focus:ring-offset-blue-002 focus:ring-blue-002`}
          id="menu-button"
          aria-expanded="true"
          aria-haspopup="true"
          onClick={() => setOpen((open) => !open)}
        >
          {options.find((it) => it.value == _value)?.label || label}
          {/* <span
            className={`${
              _status === "active" && _value !== label
                ? _variant.active.chevron
                : _variant.chevron
            }`}
          >
            <svg
              className="w-5 h-5 ml-2 -mr-1"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
              aria-hidden="true"
            >
              <path
                fillRule="evenodd"
                d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                clipRule="evenodd"
              />
            </svg>
          </span> */}
        </button>
      </div>

      <Transition
        show={open}
        as={React.Fragment}
        enter="transition ease-out duration-100"
        enterFrom="transform opacity-0 scale-95"
        enterTo="transform opacity-100 scale-100"
        leave="transition ease-in duration-75"
        leaveFrom="transform opacity-100 scale-100"
        leaveTo="transform opacity-0 scale-95"
      >
        <ul
          className={`origin-top-right absolute right-0 py-2 max-h-52 min-w-min overflow-y-auto scrollbar  shadow-xl bg-white ring-1 ring-black ring-opacity-5 focus:outline-none ${_variant.list}`}
          role="menu"
          aria-orientation="vertical"
          aria-labelledby="menu-button"
          tabIndex={-1}
          style={{ maxHeight: listHeight ? listHeight : 208 }}
        >
          {/* {_value !== label && (
            <li className="text-blue-005 hover:font-medium hover:cursor-pointer flex justify-start w-full px-2 text-base">
              <span
                className="hover:bg-blue-001 w-full h-full px-2 py-1 "
                style={{ display: "block" }}
                //value={label}
                onClick={(e: React.MouseEvent) => {
                  setValue(label);
                  handleChange(label);
                  setOpen(false);
                  setStatus("active");
                }}
              >
                {label}
              </span>
            </li>
          )} */}
          {options.map((option) => (
            <li
              key={option?.value}
              className="text-blue-005 hover:font-medium hover:cursor-pointer flex justify-start w-full px-2 text-base"
            >
              <span
                className="hover:bg-blue-001 w-full h-full px-2 py-1 "
                style={{ display: "block" }}
                // value={option.value}
                onClick={(e: React.MouseEvent) => {
                  setValue(`${option.value}`);
                  handleChange(`${option.value}`);
                  setOpen(false);
                  setStatus("active");
                }}
              >
                {option.label}
              </span>
            </li>
          ))}
        </ul>
      </Transition>
    </div>
  );
};

export const countries = [
  //{ value: 'All countries', label: 'All countries' },
  { value: "France", label: "France" },
  { value: "USA", label: "USA" },
  { value: "Australia", label: "Australia" },
  { value: "Belgium", label: "Belgium" },
  { value: "Canada", label: "Canada" },
  { value: "China", label: "China" },
  { value: "Germany", label: "Germany" },
  { value: "Ireland", label: "Ireland" },
  { value: "Israel", label: "Israel" },
  { value: "Italy", label: "Italy" },
  { value: "Japan", label: "Japan" },
  { value: "Morocco", label: "Morocco" },
  { value: "Netherlands", label: "Netherlands" },
  { value: "Poland", label: "Poland" },
  { value: "Portugal", label: "Portugal" },
  { value: "Saudi Arabia", label: "Saudi Arabia" },
  { value: "Senegal", label: "Senegal" },
  { value: "Singapore", label: "Singapore" },
  { value: "Switzerland", label: "Switzerland" },
  { value: "Tunisia", label: "Tunisia" },
  { value: "Ukraine", label: "Ukraine" },
  { value: "United Kingdom", label: "United Kingdom" },
  { value: "United Arab Erimates", label: "United Arab Erimates" },
  { value: "Albania", label: "Albania" },
  { value: "Algeria", label: "Algeria" },
  { value: "Andorra", label: "Andorra" },
  { value: "Angola", label: "Angola" },
  { value: "Anguilla", label: "Anguilla" },
  { value: "Argentina", label: "Argentina" },
  { value: "Armenia", label: "Armenia" },
  { value: "Austria", label: "Austria" },
  { value: "Azerbaijan", label: "Azerbaijan" },
  { value: "Bahamas", label: "Bahamas" },
  { value: "Bahrain", label: "Bahrain" },
  { value: "Bangladesh", label: "Bangladesh" },
  { value: "Barbados", label: "Barbados" },
  { value: "Belarus", label: "Belarus" },
  { value: "Belize", label: "Belize" },
  { value: "Benin", label: "Benin" },
  { value: "Bermuda", label: "Bermuda" },
  { value: "Bhutan", label: "Bhutan" },
  { value: "Bolivia", label: "Bolivia" },
  { value: "Bosnia & Herzegovina", label: "Bosnia & Herzegovina" },
  { value: "Botswana", label: "Botswana" },
  { value: "Brazil", label: "Brazil" },
  { value: "Brunei", label: "Brunei" },
  { value: "Bulgaria", label: "Bulgaria" },
  { value: "Burkina Faso", label: "Burkina Faso" },
  { value: "Burundi", label: "Burundi" },
  { value: "Cambodia", label: "Cambodia" },
  { value: "Cameroon", label: "Cameroon" },
  { value: "Canary Islands", label: "Canary Islands" },
  { value: "Cape Verde", label: "Cape Verde" },
  { value: "Cayman Islands", label: "Cayman Islands" },
  {
    value: "Central African Republic",
    label: "Central African Republic",
  },
  { value: "Chad", label: "Chad" },
  { value: "Channel Islands", label: "Channel Islands" },
  { value: "Chile", label: "Chile" },
  { value: "Colombia", label: "Colombia" },
  { value: "Comoros", label: "Comoros" },
  { value: "Congo", label: "Congo" },
  { value: "Costa Rica", label: "Costa Rica" },
  { value: "Cote DIvoire", label: "Cote DIvoire" },
  { value: "Croatia", label: "Croatia" },
  { value: "Cuba", label: "Cuba" },
  { value: "Curaco", label: "Curaco" },
  { value: "Cyprus", label: "Cyprus" },
  { value: "Czech Republic", label: "Czech Republic" },
  { value: "Denmark", label: "Denmark" },
  { value: "Djibouti", label: "Djibouti" },
  { value: "Dominica", label: "Dominica" },
  { value: "Dominican Republic", label: "Dominican Republic" },
  { value: "Ecuador", label: "Ecuador" },
  { value: "Egypt", label: "Egypt" },
  { value: "El Salvador", label: "El Salvador" },
  { value: "Equatorial Guinea", label: "Equatorial Guinea" },
  { value: "Eritrea", label: "Eritrea" },
  { value: "Estonia", label: "Estonia" },
  { value: "Ethiopia", label: "Ethiopia" },
  { value: "Falkland Islands", label: "Falkland Islands" },
  { value: "Faroe Islands", label: "Faroe Islands" },
  { value: "Fiji", label: "Fiji" },
  { value: "Finland", label: "Finland" },
  { value: "French Guiana", label: "French Guiana" },
  { value: "French Polynesia", label: "French Polynesia" },
  { value: "French Southern Ter", label: "French Southern Ter" },
  { value: "Gabon", label: "Gabon" },
  { value: "Gambia", label: "Gambia" },
  { value: "Georgia", label: "Georgia" },
  { value: "Ghana", label: "Ghana" },
  { value: "Gibraltar", label: "Gibraltar" },
  { value: "Great Britain", label: "Great Britain" },
  { value: "Greece", label: "Greece" },
  { value: "Greenland", label: "Greenland" },
  { value: "Grenada", label: "Grenada" },
  { value: "Guadeloupe", label: "Guadeloupe" },
  { value: "Guatemala", label: "Guatemala" },
  { value: "Guinea", label: "Guinea" },
  { value: "Guyana", label: "Guyana" },
  { value: "Haiti", label: "Haiti" },
  { value: "Hawaii", label: "Hawaii" },
  { value: "Honduras", label: "Honduras" },
  { value: "Hong Kong", label: "Hong Kong" },
  { value: "Hungary", label: "Hungary" },
  { value: "Iceland", label: "Iceland" },
  { value: "Indonesia", label: "Indonesia" },
  { value: "India", label: "India" },
  { value: "Iran", label: "Iran" },
  { value: "Iraq", label: "Iraq" },
  { value: "Isle of Man", label: "Isle of Man" },
  { value: "Jamaica", label: "Jamaica" },
  { value: "Jordan", label: "Jordan" },
  { value: "Kazakhstan", label: "Kazakhstan" },
  { value: "Kenya", label: "Kenya" },
  { value: "Kiribati", label: "Kiribati" },
  { value: "Korea Sout", label: "Korea Sout" },
  { value: "Kuwait", label: "Kuwait" },
  { value: "Kyrgyzstan", label: "Kyrgyzstan" },
  { value: "Laos", label: "Laos" },
  { value: "Latvia", label: "Latvia" },
  { value: "Lebanon", label: "Lebanon" },
  { value: "Lesotho", label: "Lesotho" },
  { value: "Liberia", label: "Liberia" },
  { value: "Libya", label: "Libya" },
  { value: "Liechtenstein", label: "Liechtenstein" },
  { value: "Lithuania", label: "Lithuania" },
  { value: "Luxembourg", label: "Luxembourg" },
  { value: "Macau", label: "Macau" },
  { value: "Macedonia", label: "Macedonia" },
  { value: "Madagascar", label: "Madagascar" },
  { value: "Malaysia", label: "Malaysia" },
  { value: "Malawi", label: "Malawi" },
  { value: "Maldives", label: "Maldives" },
  { value: "Mali", label: "Mali" },
  { value: "Malta", label: "Malta" },
  { value: "Marshall Islands", label: "Marshall Islands" },
  { value: "Martinique", label: "Martinique" },
  { value: "Mauritania", label: "Mauritania" },
  { value: "Mauritius", label: "Mauritius" },
  { value: "Mayotte", label: "Mayotte" },
  { value: "Mexico", label: "Mexico" },
  { value: "Midway Islands", label: "Midway Islands" },
  { value: "Moldova", label: "Moldova" },
  { value: "Monaco", label: "Monaco" },
  { value: "Mongolia", label: "Mongolia" },
  { value: "Mozambique", label: "Mozambique" },
  { value: "Nambia", label: "Nambia" },
  { value: "Nepal", label: "Nepal" },
  { value: "New Caledonia", label: "New Caledonia" },
  { value: "New Zealand", label: "New Zealand" },
  { value: "Nicaragua", label: "Nicaragua" },
  { value: "Niger", label: "Niger" },
  { value: "Nigeria", label: "Nigeria" },
  { value: "Norfolk Island", label: "Norfolk Island" },
  { value: "Norway", label: "Norway" },
  { value: "Oman", label: "Oman" },
  { value: "Pakistan", label: "Pakistan" },
  { value: "Palestine", label: "Palestine" },
  { value: "Panama", label: "Panama" },
  { value: "Papua New Guinea", label: "Papua New Guinea" },
  { value: "Paraguay", label: "Paraguay" },
  { value: "Peru", label: "Peru" },
  { value: "Phillipines", label: "Phillipines" },
  { value: "Puerto Rico", label: "Puerto Rico" },
  { value: "Qatar", label: "Qatar" },
  { value: "Montenegro", label: "Montenegro" },
  { value: "Republic of Serbia", label: "Republic of Serbia" },
  { value: "Reunion", label: "Reunion" },
  { value: "Romania", label: "Romania" },
  { value: "Russia", label: "Russia" },
  { value: "Rwanda", label: "Rwanda" },
  { value: "St Barthelemy", label: "St Barthelemy" },
  { value: "St Maarten", label: "St Maarten" },
  { value: "St Pierre & Miquelon", label: "St Pierre & Miquelon" },
  { value: "Saipan", label: "Saipan" },
  { value: "Samoa", label: "Samoa" },
  { value: "San Marino", label: "San Marino" },
  { value: "Seychelles", label: "Seychelles" },
  { value: "Sierra Leone", label: "Sierra Leone" },
  { value: "Slovakia", label: "Slovakia" },
  { value: "Slovenia", label: "Slovenia" },
  { value: "Solomon Islands", label: "Solomon Islands" },
  { value: "Somalia", label: "Somalia" },
  { value: "South Africa", label: "South Africa" },
  { value: "Spain", label: "Spain" },
  { value: "Sri Lanka", label: "Sri Lanka" },
  { value: "Sudan", label: "Sudan" },
  { value: "Suriname", label: "Suriname" },
  { value: "Swaziland", label: "Swaziland" },
  { value: "Sweden", label: "Sweden" },
  { value: "Syria", label: "Syria" },
  { value: "Tahiti", label: "Tahiti" },
  { value: "Taiwan", label: "Taiwan" },
  { value: "Tajikistan", label: "Tajikistan" },
  { value: "Tanzania", label: "Tanzania" },
  { value: "Thailand", label: "Thailand" },
  { value: "Togo", label: "Togo" },
  { value: "Tokelau", label: "Tokelau" },
  { value: "Tonga", label: "Tonga" },
  { value: "Trinidad & Tobago", label: "Trinidad & Tobago" },

  { value: "Turkey", label: "Turkey" },
  { value: "Turkmenistan", label: "Turkmenistan" },
  { value: "Tuvalu", label: "Tuvalu" },
  { value: "Uganda", label: "Uganda" },
  { value: "Uraguay", label: "Uraguay" },
  { value: "Uzbekistan", label: "Uzbekistan" },
  { value: "Vanuatu", label: "Vanuatu" },
  { value: "Vatican City State", label: "Vatican City State" },
  { value: "Venezuela", label: "Venezuela" },
  { value: "Vietnam", label: "Vietnam" },
  { value: "Wallis & Futana Is", label: "Wallis & Futana Is" },
  { value: "Yemen", label: "Yemen" },
  { value: "Zaire", label: "Zaire" },
  { value: "Zambia", label: "Zambia" },
  { value: "Zimbabwe", label: "Zimbabwe" },
  { value: "Afganistan", label: "Afganistan" },
];

export const industries = [
  //{ value: 'All industries', label: 'All industries' },
  { value: "Advertising", label: "Advertising" },
  { value: "Banking", label: "Banking" },
  { value: "Consumer Goods", label: "Consumer Goods" },
  { value: "Computer Software", label: "Computer Software" },
  {
    value: "Electrical/Electronic Manufacturing",
    label: "Electrical/Electronic Manufacturing",
  },
  { value: "Food & Beverages", label: "Food & Beverages" },
  { value: "Oil & Energy", label: "Oil & Energy" },
  { value: "Farming", label: "Farming" },
  { value: "Finance", label: "Finance" },
  { value: "Investment Banking", label: "Investment Banking" },
  { value: "Insurance", label: "Insurance" },
  { value: "Internet", label: "Internet" },
  { value: "Marketing", label: "Marketing" },
  {
    value: "Non-Profit Organization Management",
    label: "Non-Profit Organization Management",
  },
  {
    value: "Pharmaceuticals and natural products",
    label: "Pharmaceuticals and natural products",
  },
  { value: "Public", label: "Public" },
  { value: "Hospital & Health Care", label: "Hospital & Health Care" },
  { value: "Renewables & Environment", label: "Renewables & Environment" },
  {
    value: "Information Technology and Services",
    label: "Information Technology and Services",
  },
  { value: "Real Estate", label: "Real Estate" },
  { value: "Services", label: "Services" },
  { value: "Telecommunications", label: "Telecommunications" },
  { value: "Transport and aerospace", label: "Transport and aerospace" },
  { value: "Other", label: "Other" },
];

export const roles = [
  //{ value: 'All roles', label: 'All roles' },
  { value: "Accounting & Finance", label: "Accounting & Finance" },
  { value: "Business Development", label: "Business Development" },
  { value: "CSR", label: "CSR" },
  { value: "CEO", label: "CEO" },
  { value: "Distribution", label: "Distribution" },
  { value: "Entrepreneur", label: "Entrepreneur" },
  { value: "General Management", label: "General Management" },
  { value: "HR", label: "HR" },
  { value: "IT", label: "IT" },
  { value: "Interneship", label: "Interneship" },
  { value: "Marketing & Communication", label: "Marketing & Communication" },
  { value: "Operations", label: "Operations" },
  { value: "Project Manager", label: "Project Manager" },
  { value: "Purchase", label: "Purchase" },
  { value: "Research & Development", label: "Research & Development" },
  { value: "PR", label: "PR" },
  { value: "Sales", label: "Sales" },
  { value: "Support", label: "Support" },
  { value: "Other", label: "Other" },
];

export const topics = [
  //{ value: 'All mentoring topics', label: 'All mentoring topics' },
  {
    value: "How to position yourself in the job market?",
    label: "How to position yourself in the job market?",
  },
  {
    value: "Knowledge sharing on your role, industry and location",
    label: "Knowledge sharing on your role, industry and location",
  },
];

export const months = [
  { value: 1, label: "Jan" },
  { value: 2, label: "Feb" },
  { value: 3, label: "Mar" },
  { value: 4, label: "Apr" },
  { value: 5, label: "May" },
  { value: 6, label: "Jun" },
  { value: 7, label: "Jul" },
  { value: 8, label: "Aug" },
  { value: 9, label: "Sept" },
  { value: 10, label: "Oct" },
  { value: 11, label: "Nov" },
  { value: 12, label: "Dec" },
];

export const years = [
  { value: new Date().getFullYear(), label: String(new Date().getFullYear()) },
  {
    value: new Date().getFullYear() - 1,
    label: String(new Date().getFullYear() - 1),
  },
  {
    value: new Date().getFullYear() - 2,
    label: String(new Date().getFullYear() - 2),
  },
  {
    value: new Date().getFullYear() - 3,
    label: String(new Date().getFullYear() - 3),
  },
  {
    value: new Date().getFullYear() - 4,
    label: String(new Date().getFullYear() - 4),
  },
  {
    value: new Date().getFullYear() - 5,
    label: String(new Date().getFullYear() - 5),
  },
  {
    value: new Date().getFullYear() - 6,
    label: String(new Date().getFullYear() - 6),
  },
  {
    value: new Date().getFullYear() - 7,
    label: String(new Date().getFullYear() - 7),
  },
  {
    value: new Date().getFullYear() - 8,
    label: String(new Date().getFullYear() - 8),
  },
  {
    value: new Date().getFullYear() - 9,
    label: String(new Date().getFullYear() - 9),
  },
  {
    value: new Date().getFullYear() - 10,
    label: String(new Date().getFullYear() - 10),
  },
  {
    value: new Date().getFullYear() - 11,
    label: String(new Date().getFullYear() - 11),
  },
  {
    value: new Date().getFullYear() - 12,
    label: String(new Date().getFullYear() - 12),
  },
  {
    value: new Date().getFullYear() - 13,
    label: String(new Date().getFullYear() - 13),
  },
  {
    value: new Date().getFullYear() - 14,
    label: String(new Date().getFullYear() - 14),
  },
  {
    value: new Date().getFullYear() - 15,
    label: String(new Date().getFullYear() - 15),
  },
  {
    value: new Date().getFullYear() - 16,
    label: String(new Date().getFullYear() - 16),
  },
  {
    value: new Date().getFullYear() - 17,
    label: String(new Date().getFullYear() - 17),
  },
  {
    value: new Date().getFullYear() - 18,
    label: String(new Date().getFullYear() - 18),
  },
  {
    value: new Date().getFullYear() - 19,
    label: String(new Date().getFullYear() - 19),
  },
  {
    value: new Date().getFullYear() - 20,
    label: String(new Date().getFullYear() - 20),
  },
  {
    value: new Date().getFullYear() - 21,
    label: String(new Date().getFullYear() - 21),
  },
  {
    value: new Date().getFullYear() - 22,
    label: String(new Date().getFullYear() - 22),
  },
  {
    value: new Date().getFullYear() - 23,
    label: String(new Date().getFullYear() - 23),
  },
  {
    value: new Date().getFullYear() - 24,
    label: String(new Date().getFullYear() - 24),
  },
  {
    value: new Date().getFullYear() - 25,
    label: String(new Date().getFullYear() - 25),
  },
  {
    value: new Date().getFullYear() - 26,
    label: String(new Date().getFullYear() - 26),
  },
  {
    value: new Date().getFullYear() - 27,
    label: String(new Date().getFullYear() - 27),
  },
  {
    value: new Date().getFullYear() - 28,
    label: String(new Date().getFullYear() - 28),
  },
  {
    value: new Date().getFullYear() - 29,
    label: String(new Date().getFullYear() - 29),
  },
  {
    value: new Date().getFullYear() - 30,
    label: String(new Date().getFullYear() - 30),
  },
];

export const yearsStudent = [
  { value: new Date().getFullYear(), label: String(new Date().getFullYear()) },
  {
    value: new Date().getFullYear() - 1,
    label: String(new Date().getFullYear() - 1),
  },
  {
    value: new Date().getFullYear() - 2,
    label: String(new Date().getFullYear() - 2),
  },
  {
    value: new Date().getFullYear() - 3,
    label: String(new Date().getFullYear() - 3),
  },
  {
    value: new Date().getFullYear() - 4,
    label: String(new Date().getFullYear() - 4),
  },
  {
    value: new Date().getFullYear() - 5,
    label: String(new Date().getFullYear() - 5),
  },
];

export const programTopics = [
  { value: "Management", label: "Management" },
  { value: "Entrepreneurship", label: "Entrepreneurship" },
  { value: "International", label: "International" },
  { value: "Finance", label: "Finance" },
  { value: "Audit", label: "Audit" },
  { value: "Global Performance", label: "Global Performance" },
  { value: "Green Investment", label: "Green Investment" },
  { value: "Human Resources", label: "Human Resources" },
  { value: "Strategy and Consulting", label: "Strategy and Consulting" },
  { value: "Marketing", label: "Marketing" },
  { value: "Sales", label: "Sales" },
  {
    value: "Purchasing and Supply Chain",
    label: "Purchasing and Supply Chain",
  },
  { value: "Communication and Media", label: "Communication and Media" },
  { value: "Digital Strategy", label: "Digital Strategy" },
  { value: "Design", label: "Design" },
  { value: "Data Management", label: "Data Management" },
  {
    value: "Leadership and Coaching",
    label: "Leadership and Coaching",
  },
  { value: "Energy Shift", label: "Energy Shift" },
  { value: "Luxury", label: "Luxury" },
  { value: "Sports", label: "Sports" },
  { value: "Art and Culture", label: "Art and Culture" },
  { value: "Food & Beverage", label: "Food & Beverage" },
];
