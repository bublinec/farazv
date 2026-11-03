
# wont work (backgup downloaded from heroku is not a dumb but sth else)
pg_restore -U postgres -h containers-us-west-48.railway.app -p 6835 -W -F t -d railway farazv-db-backup-13-2


# create proper heroku dump
pg_dump -h ec2-18-202-1-222.eu-west-1.compute.amazonaws.com -d dc8ethgjvov6fm -U gvcclpetevwgph-p 5432 -W -F  > latest.dump

# use it
pg_restore -U postgres -h containers-us-west-48.railway.app -p 6835 -W -F t -d railway latest.dump
