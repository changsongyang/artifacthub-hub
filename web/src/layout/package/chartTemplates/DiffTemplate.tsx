import 'react-diff-view/style/index.css';

import { isNull } from 'lodash';
import { Dispatch, SetStateAction, useCallback, useEffect, useState } from 'react';
import { Decoration, Diff, Hunk, parseDiff } from 'react-diff-view';

import { CompareChartTemplate, CompareChartTemplateStatus } from '../../../types';
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
  status?: CompareChartTemplateStatus;
  removeLoading: () => void;
}

const Changes = (props: DiffProps) => {
  const files = parseDiff(props.diffText);

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
      <div key={`${oldRevision}-${newRevision}`} className="file-diff">
        <header className="diff-header fw-bold">{`${oldPath} -> ${newPath}`}</header>
        <Diff viewType="unified" diffType={type} hunks={hunks}>
          {(hunks: any[]) =>
            hunks.map((hunk, index) => {
              return [
                <Decoration key={`deco-${hunk.content}-${index}`}>
                  <div className="hunk-header my-2 fw-bold">{hunk.content}</div>
                </Decoration>,
                <Hunk key={`${hunk.content}-${index}`} hunk={hunk} />,
                <>
                  {index + 1 === hunks.length &&
                    !oldEndingNewLine &&
                    props.status !== CompareChartTemplateStatus.Deleted && (
                      <tbody key={`${hunk.content}-newLine-${index}`}>
                        <tr>
                          <td></td>
                          <td></td>
                          <td className={styles.newLine}>\ No newline at end of file</td>
                        </tr>
                      </tbody>
                    )}
                </>,
              ];
            })
          }
        </Diff>
      </div>
    );
  };

  useEffect(() => {
    props.removeLoading();
  }, [props.diffText]); /* eslint-disable-line react-hooks/exhaustive-deps */

  return <div>{files.map(renderFile)}</div>;
};

const DiffTemplate = (props: Props) => {
  const [diffContent, setDiffContent] = useState<string | null>(null);

  const removeLoading = useCallback(() => {
    props.setIsChangingTemplate(false);
  }, []); /* eslint-disable-line react-hooks/exhaustive-deps */

  useEffect(() => {
    const prepareDiff = () => {
      setDiffContent(
        DiffLibrary.createTwoFilesPatch(
          `  ${props.template.name}`,
          '  ',
          props.template.data,
          props.template.compareData,
          props.diffVersion,
          props.currentVersion,
          { context: 0 }
        )
      );
    };

    prepareDiff();
  }, [props.template]); /* eslint-disable-line react-hooks/exhaustive-deps */

  return (
    <>
      {!isNull(diffContent) && (
        <Changes
          diffText={`diff --git \n ${diffContent}`}
          status={props.template.status}
          removeLoading={removeLoading}
        />
      )}
    </>
  );
};

export default DiffTemplate;
