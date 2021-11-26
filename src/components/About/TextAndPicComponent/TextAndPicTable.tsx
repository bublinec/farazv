import { SimpleGrid } from '@chakra-ui/react';
import { FlatTree } from 'framer-motion';
import React from 'react'
import { TextAndPicProps } from '../../../lib/features/page/content-sections.d.'
import TextAndPic from './TextAndPic';

interface TextAndPicTableProps {
    isAlternate:boolean;
    TextAndPicS:TextAndPicProps[]
}

const TextAndPicTable = (props: TextAndPicTableProps) => {
    const {isAlternate,TextAndPicS, ...restOfProps }=props;

    function* gen(){
        while(true){
            console.log(false)
            yield false;
            console.log(true)
            yield true;
            
        }
    }
    const genIsRevers=gen();
    return (
        <SimpleGrid>
            {TextAndPicS.map((item)=>{
                return <TextAndPic text={item.text} img_src={item.img_src} heading={item.heading} direction={isAlternate?( genIsRevers.next().value?1:2):2}/>
            })}
        </SimpleGrid>
    )
}

export default TextAndPicTable
