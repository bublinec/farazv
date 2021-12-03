import { Box, BoxProps } from "@chakra-ui/react";
import React from "react";
import { BsChevronLeft, BsChevronRight } from "react-icons/bs";
import Slider, { Settings } from "react-slick";
import "slick-carousel/slick/slick-theme.css";
import "slick-carousel/slick/slick.css";
import "../../../assets/styles/slick-custom-theme.css";
import { useWeeklyAnnouncements } from "../../../lib/features/weekly-announcements/hooks/useWeeklyAnnouncements";
import { getTodayIndex } from "../../../lib/utils/dateUtils";
import { capitalize, formatTime } from "../../../lib/utils/stringUtils";
import { CarouselArrow } from "./CarouselArrow";
import { MassTimesCarouselItem } from "./MassTimesCarouselItem";

export interface MassTimesCarouselProps extends BoxProps {}

const settings: Settings = {
  slidesToShow: 1,
  slidesToScroll: 1,
  infinite: false,
  arrows: true,
  nextArrow: <CarouselArrow icon={<BsChevronRight />} />,
  prevArrow: <CarouselArrow icon={<BsChevronLeft />} />
};

export const MassTimesCarousel = (props: MassTimesCarouselProps) => {
  const { ...restOfProps } = props;
  const data = useWeeklyAnnouncements();
  const { announcements, donations, ...nextWeekDays } = data[1];
  const days: WeeklyAnnouncements.Day[] = [
    data[0].sunday,
    ...Object.values(nextWeekDays)
  ];
  settings.initialSlide = getTodayIndex(days);

  return (
    <Box {...restOfProps} maxW={440}>
      <Slider {...settings}>
        {Object.values(days).map((day) => {
          const date = new Date(day.date);
          return (
            <MassTimesCarouselItem
              key={day.date}
              day={capitalize(date.toLocaleString("sk", { weekday: "long" }))}
              date={day.date}
              items={day.masses.map((mass) => {
                return {
                  time: formatTime(mass.time),
                  name: mass.priest.surname,
                  value: mass.label
                };
              })}
              iconText={day.liturgy}
            />
          );
        })}
      </Slider>
    </Box>
  );
};
