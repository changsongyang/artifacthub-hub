import 'react-diff-view/style/index.css';

import { isNull } from 'lodash';
import { Dispatch, SetStateAction, useEffect, useState } from 'react';
import { Decoration, Diff, Hunk, parseDiff } from 'react-diff-view';

import { CompareChartTemplate } from '../../../types';
import styles from './DiffTemplate.module.css';

const DiffLibrary = require('diff');

interface Props {
  currentVersion: string;
  diffVersion: string;
  template: CompareChartTemplate;
  setIsChangingTemplate: Dispatch<SetStateAction<boolean>>;
}

interface DiffProps {
  diffText: string;
  setIsChangingTemplate: Dispatch<SetStateAction<boolean>>;
}

const DiffTemplate = (props: Props) => {
  const [diffContent, setDiffContent] = useState<string | null>(null);

  const Appdiff = (props: DiffProps) => {
    const files = parseDiff(props.diffText);
    console.log(files);

    const renderFile = ({
      oldPath,
      newPath,
      oldRevision,
      newRevision,
      type,
      hunks,
      oldEndingNewLine,
      newEndingNewLine,
    }: any) => {
      return (
        <div key={oldRevision + '-' + newRevision} className="file-diff">
          <header className="diff-header fw-bold">{`${oldPath} -> ${newPath}`}</header>
          {hunks.length === 0 ? (
            <div className="py-5 text-center fst-italic">TODO</div>
          ) : (
            <Diff viewType="unified" diffType={type} hunks={hunks}>
              {(hunks: any[]) =>
                hunks.map((hunk) => [
                  <Decoration key={'deco-' + hunk.content}>
                    <div className="hunk-header my-2 fw-bold">{hunk.content}</div>
                  </Decoration>,
                  <Hunk key={hunk.content} hunk={hunk} />,
                ])
              }
            </Diff>
          )}
          {newEndingNewLine && <div className={styles.newLine}>\ No newline at end of file</div>}
        </div>
      );
    };
    return <div>{files.map(renderFile)}</div>;
  };

  useEffect(() => {
    const prepareDiff = () => {
      setDiffContent(
        DiffLibrary.createTwoFilesPatch(
          `  ${props.template.name}`,
          '  ',
          props.template.data,
          props.template.compareData,
          props.diffVersion,
          props.currentVersion
        )
      );
      props.setIsChangingTemplate(false);
    };

    prepareDiff();
  }, [props]);

  return (
    <>
      {!isNull(diffContent) && (
        <Appdiff diffText={`diff --git \n ${diffContent}`} setIsChangingTemplate={props.setIsChangingTemplate} />
      )}
    </>
  );
};

export default DiffTemplate;
