import { Box } from "@chakra-ui/layout";
import { BoxProps } from "@chakra-ui/react";
import GoogleMapReact from "google-map-react";
import React from "react";
import { FaMapMarkerAlt } from "react-icons/fa";

export interface MapProps extends BoxProps {
  coordinates: {
    lat: number;
    lng: number;
  };
}

const MAP_KEY = "AIzaSyAJANUuKIFRxo-wO6GJdmP2TF6Vmfdb0ks";

export const Map = (props: MapProps) => {
  const { coordinates } = props;
  return (
    <Box h={"full"}>
      <GoogleMapReact
        bootstrapURLKeys={{
          key: MAP_KEY
        }}
        defaultCenter={coordinates}
        defaultZoom={17}
      >
        <Box
          color="primary"
          fontSize={"5xl"}
          style={{ transform: "translate(-23px, -46px)" }}
          lat={coordinates.lat}
          lng={coordinates.lng}
        >
          <FaMapMarkerAlt />
        </Box>.
      </GoogleMapReact>
    </Box>
  );
};
