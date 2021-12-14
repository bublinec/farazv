import { Box, BoxProps, Flex, useBreakpointValue } from "@chakra-ui/react";
import React, { useState } from "react";
import Slider, { Settings } from "react-slick";
import "slick-carousel/slick/slick-theme.css";
import "slick-carousel/slick/slick.css";
import "../../../assets/styles/slick-custom-theme.css";
import { useWeeklyAnnouncements } from "../../../lib/features/weekly-announcements/hooks/useWeeklyAnnouncements";
import { getTodayIndex } from "../../../lib/utils/dateUtils";
import { formatTime } from "../../../lib/utils/stringUtils";
import { ArrowButton } from "../../Shared/ArrowButton/ArrowButton";
import { MassTimesCarouselItem } from "./MassTimesCarouselItem";

export interface MassTimesCarouselProps extends BoxProps {}

const settings: Settings = {
  slidesToShow: 1,
  slidesToScroll: 1,
  infinite: false,
  arrows: false
};

export const MassTimesCarousel = (props: MassTimesCarouselProps) => {
  const { ...restOfProps } = props;
  const data = useWeeklyAnnouncements();
  const { announcements, donations, ...nextWeekDays } = data[1];
  const carouselRef = React.createRef<Slider>();
  const days: WeeklyAnnouncements.Day[] = [
    data[0].sunday,
    ...Object.values(nextWeekDays)
  ];
  const [currentSlide, setCurrentSlide] = useState(0);
  const isFirstSlide = currentSlide === 0;
  const futureDays = days.slice(getTodayIndex(days));
  const isLastSlide = currentSlide === futureDays.length - 1;
  const buttonLabels = useBreakpointValue({
    base: {
      back: "Späť",
      today: "Späť na dnes",
      next: "Ďalej"
    },
    md: {
      back: "Predchádzajúci deň",
      today: "Späť na dnes",
      next: "Nasledujúci deň"
    }
  });

  return (
    <Box {...restOfProps} h="full">
      <Flex
        justifyContent={"space-between"}
        h="full"
        pb={{ base: 8, md: 12 }}
        flexDir="column"
      >
        <Slider {...settings} ref={carouselRef}>
          {Object.values(futureDays).map((day) => {
            return (
              <MassTimesCarouselItem
                key={day.date}
                liturgy={day.liturgy}
                date={day.date}
                items={day.masses.map((mass) => {
                  return {
                    time: formatTime(mass.time),
                    name: mass.priest.surname,
                    label: mass.label
                  };
                })}
              />
            );
          })}
        </Slider>
        <Flex
          w="full"
          justifyContent={isFirstSlide ? "flex-end" : "space-between"}
        >
          {!isFirstSlide && (
            <ArrowButton
              label={buttonLabels?.back}
              onClick={() => {
                carouselRef?.current?.slickPrev();
                setCurrentSlide(currentSlide - 1);
              }}
              rightIcon={false}
              leftIcon
            />
          )}
          {!isFirstSlide && (
            <ArrowButton
              label={buttonLabels?.today}
              mr={{ base: -4, md: 5 }}
              onClick={() => {
                carouselRef?.current?.slickGoTo(0);
                setCurrentSlide(0);
              }}
              rightIcon={false}
            />
          )}
          {!isLastSlide && (
            <ArrowButton
              label={isFirstSlide ? "Zajtra" : buttonLabels?.next}
              onClick={() => {
                carouselRef?.current?.slickNext();
                setCurrentSlide(currentSlide + 1);
              }}
            />
          )}
        </Flex>
      </Flex>
    </Box>
  );
};
