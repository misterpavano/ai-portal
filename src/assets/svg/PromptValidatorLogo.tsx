interface PromptValidatorLogoProps extends React.SVGProps<SVGSVGElement> {
  isPromptDisabled?: boolean;
}

const PromptValidatorLogo: React.FC<PromptValidatorLogoProps> = ({
  isPromptDisabled,
  ...props
}) => (
  <svg
    width="45"
    height="45"
    viewBox="0 0 45 45"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <rect
      x="0.666748"
      y="0.5"
      width="44"
      height="44"
      rx="22"
      fill="url(#paint0_linear_1735_252)"
    />
    <g clipPath="url(#clip0_1735_252)">
      <path
        d="M19.2268 14.1904C18.1348 14.6424 17.1426 15.305 16.3068 16.1404"
        stroke="#DAE9FF"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
      <path
        d="M14.3567 19.0596C13.9033 20.1499 13.6689 21.3187 13.6667 22.4996"
        stroke="#DAE9FF"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
      <path
        d="M14.3568 25.9404C14.8087 27.0323 15.4713 28.0246 16.3068 28.8604"
        stroke="#DAE9FF"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
      <path
        d="M19.2267 30.8096C20.317 31.263 21.4859 31.4975 22.6667 31.4996"
        stroke="#DAE9FF"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
      <path
        d="M26.1068 30.8104C27.1987 30.3584 28.1909 29.6958 29.0268 28.8604"
        stroke="#DAE9FF"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
      <path
        d="M30.9767 25.94C31.4302 24.8497 31.6646 23.6808 31.6667 22.5"
        stroke="#DAE9FF"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
      <path
        d="M30.9767 19.0596C30.5247 17.9677 29.8621 16.9755 29.0267 16.1396"
        stroke="#DAE9FF"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
      <path
        d="M26.1067 14.19C25.0164 13.7366 23.8476 13.5021 22.6667 13.5"
        stroke="#DAE9FF"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
      <path
        d="M19.6667 22.5L21.6667 24.5L25.6667 20.5"
        stroke="#DAE9FF"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
    </g>
    <defs>
      <linearGradient
        id="paint0_linear_1735_252"
        x1="11.5548"
        y1="-30.778"
        x2="79.6844"
        y2="-20.2794"
        gradientUnits="userSpaceOnUse"
      >
        <stop stop-color="#0066FF" />
        <stop offset="1" stop-color="#CFDFFF" />
      </linearGradient>
      <clipPath id="clip0_1735_252">
        <rect
          width="24"
          height="24"
          fill="white"
          transform="translate(10.6667 10.5)"
        />
      </clipPath>
    </defs>
  </svg>
);

export default PromptValidatorLogo;
