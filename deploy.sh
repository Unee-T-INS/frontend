#!/bin/bash
set -e

echo "START $0 $(date)"
STAGE=dev
SERVICE=meteor

# Usage info
show_help() {
cat << EOF
Usage: ${0##*/} [-p]

By default, deploy to dev environment on AWS account

	-p          PRODUCTION
	-d          DEMO

EOF
}

while getopts "pd" opt
do
	case $opt in
		#Add option d for development
		d)
			echo "DEVELOPMENT" >&2
			STAGE=dev
			;;
		p)
			echo "PRODUCTION" >&2
			STAGE=prod
			;;
		#Change option demo from d to s
		s)
			echo "DEMO" >&2
			STAGE=demo
			;;
		*)
			show_help >&2
			exit 1
			;;
	esac
done

shift "$((OPTIND-1))"   # Discard the options and sentinel --

# We get the value for the commit we are deploying

export COMMIT=$(git rev-parse --short HEAD)

# Display information for easier debugging

echo '# The STAGE we are deploying is: ' $STAGE
echo '# The PROFILE we use is: ' $TRAVIS_PROFILE

if ! aws configure --profile $TRAVIS_PROFILE list
then
	echo Profile $TRAVIS_PROFILE does not exist >&2

	if ! test "$TRAVIS_AWS_ACCESS_KEY_ID"
	then
		echo Missing $TRAVIS_AWS_ACCESS_KEY_ID >&2
		exit 1
	fi

	echo Attempting to setup one from the environment >&2
	aws configure set profile.${TRAVIS_PROFILE}.aws_access_key_id $TRAVIS_AWS_ACCESS_KEY_ID
	aws configure set profile.${TRAVIS_PROFILE}.aws_secret_access_key $TRAVIS_AWS_SECRET_ACCESS_KEY
	aws configure set profile.${TRAVIS_PROFILE}.region $TRAVIS_AWS_DEFAULT_REGION

	if ! aws configure --profile $TRAVIS_PROFILE list
	then
		echo Profile $TRAVIS_PROFILE does not exist >&2
		exit 1
	fi

fi

if ! hash ecs-cli
then
	echo Please install https://github.com/aws/amazon-ecs-cli and ensure it is in your \$PATH
	echo curl -o /usr/local/bin/ecs-cli https://s3.amazonaws.com/amazon-ecs-cli/ecs-cli-linux-amd64-latest && chmod +x /usr/local/bin/ecs-cli
	exit 1
else
	ecs-cli -version
fi

echo '# START ecs-cli configure of the `master` cluster in the region:' $TRAVIS_AWS_DEFAULT_REGION

ecs-cli configure --cluster master --region $TRAVIS_AWS_DEFAULT_REGION

echo '# END ecs-cli configure of the `master` cluster'

test -f aws-env.$STAGE && source aws-env.$STAGE

# Ensure docker compose file's STAGE env is empty for production

test "$STAGE" == prod && export STAGE=""

# We prepare a file `docker-compose-${SERVICE}.yml` based on the variables in the file `AWS-docker-compose.yml`

echo '# START prepare the file docker-compose-'${SERVICE}'.yml'

envsubst < AWS-docker-compose.yml > docker-compose-${SERVICE}.yml

echo '# END prepare the file docker-compose-'${SERVICE}'.yml'

# We do the bulk of the work here

echo '# START Deploying' $SERVICE 'with commit' $COMMIT >&2
echo '# The PROFILE we use is: ' $TRAVIS_PROFILE
echo '# target group arn is: '${MEFE_TARGET_ARN}

ecs-cli compose --aws-profile $TRAVIS_PROFILE -p ${SERVICE} -f docker-compose-${SERVICE}.yml service up \
	--target-group-arn ${MEFE_TARGET_ARN} \
	--container-name meteor \
	--container-port 3000 \
	--create-log-groups \
	--deployment-max-percent 100 \
	--deployment-min-healthy-percent 50 \
	--timeout 7

echo '# END Deploying' $SERVICE 'with commit' $COMMIT >&2

echo '# START ecs-cli configure'
echo '# The PROFILE we use is: ' $TRAVIS_PROFILE
echo '# The SERVICE is: ' $SERVICE
echo '# We use the file docker-compose-'${SERVICE}'.yml'

ecs-cli compose --aws-profile $TRAVIS_PROFILE -p ${SERVICE} -f docker-compose-${SERVICE}.yml service ps

echo '# END ecs-cli configure'

echo "END $0 $(date)"
