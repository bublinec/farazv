import { Box } from "@chakra-ui/react";
import React from "react";
import { BsChevronLeft, BsChevronRight } from "react-icons/bs";
import Slider, { Settings } from "react-slick";
import "slick-carousel/slick/slick-theme.css";
import "slick-carousel/slick/slick.css";
import "../../../assets/styles/slick-custom-theme.css";
import { SlideshowProps } from "../../../lib/features/page/content-sections.d";
import { CarouselArrow } from "../../Home/MassTimesCarousel/CarouselArrow";
import { Slide } from "./Slide";

const settings: Settings = {
  slidesToShow: 1,
  slidesToScroll: 1,
  autoplay: true,
  speed: 2000,
  autoplaySpeed: 5000,
  infinite: true,
  arrows: true,
  nextArrow: <CarouselArrow icon={<BsChevronRight />} zIndex={50} />,
  prevArrow: <CarouselArrow icon={<BsChevronLeft />} />
};

export const Slideshow = (props: SlideshowProps) => {
  const { slides, ...restOfProps } = props;
  const sliderRef = React.createRef<Slider>();

  console.log(slides);

  return (
    <Box {...restOfProps}>
      <Slider {...settings} ref={sliderRef}>
        {slides.map((slide, i) => (
          <Slide
            {...slide}
            key={i}
            prev={() => sliderRef?.current?.slickPrev()}
            next={() => sliderRef?.current?.slickNext()}
          />
        ))}
      </Slider>
    </Box>
  );
};
